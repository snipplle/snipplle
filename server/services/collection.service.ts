import type { SupabaseClient } from '@supabase/supabase-js'
import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'

import { StorageService } from './storage.service'
import { SnippetService } from './snippet.service'

import { contentTypes } from '../utils/codeFormat'

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

  async getCollectionSnippets(id: string, workspaceId: string): Promise<any> {
    const { data: collection, error: collectionError } =
      await this.getCollection({
        id,
        workspaceId,
      })

    if (!collection || collectionError) {
      return {
        data: collection,
        error: collectionError,
      }
    }

    const { data: metaFile, error: metaError } =
      await this.storageService.download(
        'collections',
        collection.path as string,
      )

    if (!metaFile || metaError) {
      return {
        data: metaFile,
        error: metaError,
      }
    }

    const metaData = JSON.parse(await metaFile.text())

    const { data, error } = await this.snippetService.getSnippetsForCollection(
      metaData.snippets,
    )

    if (!data || error) {
      return {
        data,
        error,
      }
    }

    const snippets = [...data]

    metaData.snippets.forEach((snippet: any) => {
      const exists = data.some((item: any) => item.id === snippet.id)

      if (!exists) {
        snippets.push(snippet)
      }
    })

    return {
      data: snippets,
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

  async pullCollection(
    workspaceId: string,
    collectionSlug: string,
  ): Promise<any> {
    const { data: collection, error: collectionError } =
      await this.getCollection({
        workspaceId,
        slug: collectionSlug,
      })

    if (!collection || collectionError) {
      return {
        data: collection,
        error: collectionError,
      }
    }

    const { data: metaFile, error: metaFileError } =
      await this.storageService.download(
        'collections',
        collection.path as string,
      )

    if (!metaFile || metaFileError) {
      return {
        data: metaFile,
        error: metaFileError,
      }
    }

    const metaData = JSON.parse(await metaFile.text())

    const { data, error } = await this.storageService.getSignedUrl(
      metaData.path,
    )

    if (!data || error) {
      return {
        data,
        error,
      }
    }

    return {
      data: data.signedUrl,
      error,
    }
  }

  private async createFirstVersion(
    payload: any,
    collection: any,
  ): Promise<DatabaseResponse<any | null>> {
    const codeFile = this.prepareCodeFile(
      payload.collectionCode,
      contentTypes[collection.language],
    )

    const { data: file, error: uploadError } = await this.uploadFile(
      `${payload.workspaceId}/collections/${collection.slug}/index.${collection.language}`,
      codeFile,
      {
        contentType: contentTypes[collection.language],
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

    const metaData = this.prepareMetaData(file.path, snippets)

    const { data: metaFile, error: metaUploadError } = await this.uploadFile(
      `${payload.workspaceId}/collections/${collection.slug}/meta.json`,
      metaData,
      {
        contentType: contentTypes.json,
      },
    )

    if (!metaFile || metaUploadError) {
      await this.removeCollectionFiles([
        `${payload.workspaceId}/collections/${collection.slug}`,
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

    const codeFile = this.prepareCodeFile(
      payload.collectionCode,
      contentTypes[collection.language],
    )

    const { data: file, error: uploadError } = await this.uploadFile(
      metaData.path,
      codeFile,
      {
        contentType: contentTypes[collection.language],
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

    const newMetaData = this.prepareMetaData(file.path, snippets, metaData)

    const { data: newMetaFile, error: metaUploadError } = await this.uploadFile(
      collection.path,
      newMetaData,
      {
        upsert: true,
        contentType: contentTypes.json,
      },
    )

    if (!newMetaFile || metaUploadError) {
      await this.removeCollectionFiles([
        `${payload.workspaceId}/collections/${collection.slug}`,
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
    path: string,
    snippets: any,
    oldMetaData?: any,
  ): Blob {
    let metaData = {
      path,
      snippets,
    }

    if (oldMetaData) {
      metaData = {
        ...oldMetaData,
        snippets,
      }
    }

    return new Blob([JSON.stringify(metaData, null, 2)], {
      type: contentTypes.json,
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
