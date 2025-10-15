import type { SupabaseClient } from '@supabase/supabase-js'
import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'

import { StorageService } from './storage.service'
import { SnippetService } from './snippet.service'

import type { Database, Tables } from '../types/database.types'
import type { DatabaseResponse } from '../types/api.types'

export class CollectionService {
  private storageService: StorageService
  private snippetService: SnippetService

  constructor(private supabase: SupabaseClient<Database>) {
    this.storageService = new StorageService(supabase)
    this.snippetService = new SnippetService(supabase)
  }

  async getCollections(
    payload: any,
  ): Promise<DatabaseResponse<Tables<'collections'>[] | null>> {
    const from = (Number(payload.page) - 1) * Number(payload.itemsPerPage)
    const to = from + Number(payload.itemsPerPage) - 1

    const query = this.supabase
      .from('collections')
      .select(
        `
      *,
      collection_tags!inner(
        tags!inner(name, color)
      )
    `,
        { count: 'exact' },
      )
      .in(
        'workspace_id',
        payload.workspaceIds.map((workspace: any) => workspace.workspace_id),
      )
      .range(from, to)

    if (payload.orderBy) {
      const order = orderByMap[payload.orderBy as string]

      query.order(order.field, {
        ascending: order.ascending,
      })
    }

    if (payload.lang) {
      query.eq('language', payload.lang as string)
    }

    if (payload.tag) {
      query.eq('collection_tags.tags.name', payload.tag as string)
    }

    if (payload.search) {
      query.ilike('name', `%${payload.search}%`)
    }

    const { data, count, error } = await query

    return {
      data,
      count,
      error,
    }
  }

  async getCollection(
    payload: any,
  ): Promise<DatabaseResponse<Tables<'collections'> | null>> {
    const query = this.supabase
      .from('collections')
      .select()
      .eq('workspace_id', payload.workspaceId as string)

    if (payload.slug) {
      query.eq('slug', payload.slug)
    }

    if (payload.id) {
      query.eq('id', payload.id)
    }

    const { data, error } = await query.single()

    return {
      data,
      error,
    }
  }

  async createCollection(
    payload: any,
    userId: string,
    workspaceId: string,
  ): Promise<DatabaseResponse<Tables<'collections'> | null>> {
    const { data, error } = await this.supabase
      .from('collections')
      .insert({
        id: createId(),
        name: payload.name,
        slug: slugify(payload.name, {
          lower: true,
          remove: /[*+~.()'"!:@]/g,
        }),
        language: payload.language,
        description: payload.description,
        is_public: payload.isPublic,
        created_by: userId,
        workspace_id: workspaceId,
      })
      .select()
      .single()

    return {
      data,
      error,
    }
  }

  async updateCollection(
    id: string,
    payload: any,
  ): Promise<DatabaseResponse<Tables<'collections'> | null>> {
    const { data, error } = await this.supabase
      .from('collections')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    return {
      data,
      error,
    }
  }

  async createCollectionTag(
    collectionId: string,
    tagId: string,
  ): Promise<DatabaseResponse<Tables<'collection_tags'> | null>> {
    const { data, error } = await this.supabase
      .from('collection_tags')
      .insert({
        collection_id: collectionId,
        tag_id: tagId,
      })
      .select()
      .single()

    return {
      data,
      error,
    }
  }

  async uploadCollection(payload: any): Promise<DatabaseResponse<any | null>> {
    const { data: collection, error: collectionError } =
      await this.getCollection({
        workspaceId: payload.workspaceId,
        id: payload.id,
      })

    if (!collection || collectionError) {
      return {
        data: collection,
        error: collectionError,
      }
    }

    if (!collection.path) {
      const { data, error } = await this.createFirstVersion(payload, collection)

      return {
        data,
        error,
      }
    }

    const { data, error } = await this.createNewVersion(payload, collection)

    return {
      data,
      error,
    }
  }

  async deleteCollection(
    id: string,
    userId: string,
  ): Promise<DatabaseResponse<Tables<'collections'> | null>> {
    const { data, error } = await this.supabase
      .from('collections')
      .delete()
      .eq('id', id)
      .eq('created_by', userId)

    return {
      data,
      error,
    }
  }

  private async createFirstVersion(
    payload: any,
    collection: any,
  ): Promise<DatabaseResponse<any | null>> {
    const latestVersion = 1
    const codeFile = this.prepareCodeFile(
      payload.collectionCode,
      `application/typescript`,
    )

    const { data: file, error: uploadError } = await this.uploadFile(
      `${payload.workspaceId}/collections/${collection.slug}/${latestVersion}/index.${collection.language}`,
      codeFile,
      {
        contentType: `application/typescript`,
      },
    )

    if (!file || uploadError) {
      return {
        data: file,
        error: uploadError,
      }
    }

    const { data: snippets, error: snippetError } =
      await this.snippetService.getSnippetsForCollection(payload.snippets)

    if (!snippets || snippetError) {
      return {
        data: snippets,
        error: snippetError,
      }
    }

    const metaData = this.prepareMetaData(latestVersion, file.path, snippets)

    const { data: metaFile, error: metaUploadError } = await this.uploadFile(
      `${payload.workspaceId}/collections/${collection.slug}/meta.json`,
      metaData,
      {
        contentType: `application/json`,
      },
    )

    if (!metaFile || metaUploadError) {
      await this.removeCollectionFiles([
        `${payload.workspaceId}/collections/${collection.slug}/${latestVersion}`,
      ])

      return {
        data: metaFile,
        error: metaUploadError,
      }
    }

    const { data, error } = await this.updateCollection(collection.id, {
      path: metaFile.path,
    })

    return {
      data,
      error,
    }
  }

  private async createNewVersion(payload: any, collection: any): Promise<any> {
    const { data: metaFile, error: metaFileError } =
      await this.storageService.download('collections', collection.path)

    if (!metaFile || metaFileError) {
      return {
        data: metaFile,
        error: metaFileError,
      }
    }

    const metaData = JSON.parse(await metaFile.text())
    const newVersion = metaData.latest + 1

    const codeFile = this.prepareCodeFile(
      payload.collectionCode,
      `application/typescript`,
    )

    const { data: file, error: uploadError } = await this.uploadFile(
      `${payload.workspaceId}/collections/${collection.slug}/${newVersion}/index.${collection.language}`,
      codeFile,
      {
        contentType: `application/typescript`,
      },
    )

    if (!file || uploadError) {
      return {
        data: file,
        error: uploadError,
      }
    }

    const { data: snippets, error: snippetError } =
      await this.snippetService.getSnippetsForCollection(payload.snippets)

    if (!snippets || snippetError) {
      return {
        data: snippets,
        error: snippetError,
      }
    }

    const newMetaData = this.prepareMetaData(
      newVersion,
      file.path,
      snippets,
      metaData,
    )

    const { data: newMetaFile, error: metaUploadError } = await this.uploadFile(
      collection.path,
      newMetaData,
      {
        upsert: true,
        contentType: `application/json`,
      },
    )

    if (!newMetaFile || metaUploadError) {
      await this.removeCollectionFiles([
        `${payload.workspaceId}/collections/${collection.slug}/${newVersion}`,
      ])

      return {
        data: newMetaFile,
        error: metaUploadError,
      }
    }

    const { data, error } = await this.getCollection({
      workspaceId: payload.workspaceId,
      id: collection.id,
    })

    return {
      data,
      error,
    }
  }

  private prepareCodeFile(code: string, contentType: string): Blob {
    const beautifiedCode = beautifyCode(code)

    return new Blob([beautifiedCode], {
      type: contentType,
    })
  }

  private prepareMetaData(
    version: number,
    path: string,
    snippets: any,
    oldMetaData?: any,
  ): Blob {
    let metaData = {
      latest: version,
      versions: [
        {
          id: createId(),
          v: version,
          path,
          snippets: snippets,
          createdAt: new Date(),
        },
      ],
    }

    if (oldMetaData) {
      metaData = {
        ...oldMetaData,
        latest: version,
        versions: [
          ...oldMetaData.versions,
          {
            id: createId(),
            v: version,
            path,
            snippets: snippets,
            createdAt: new Date(),
          },
        ],
      }
    }

    return new Blob([JSON.stringify(metaData, null, 2)], {
      type: 'application/json',
    })
  }

  private async uploadFile(
    path: string,
    file: Blob,
    options?: any,
  ): Promise<any> {
    const { data, error } = await this.storageService.upload(
      'collections',
      path,
      file,
      options,
    )

    return {
      data,
      error,
    }
  }

  private async removeCollectionFiles(paths: string[]): Promise<void> {
    await this.supabase.storage.from('collections').remove(paths)
  }
}
