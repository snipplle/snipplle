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
      workspaces(slug),
      ${
        payload.tag
          ? `collection_tags!inner(tags!inner(name, color))`
          : `collection_tags(
        tags(name, color)
      )`
      }
    `,
        { count: 'exact' },
      )
      .range(from, to)

    if (payload.workspaceIds) {
      query.in(
        'workspace_id',
        payload.workspaceIds.map((workspace: any) => workspace.workspace_id),
      )
    }

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

    if (payload.onlyPublic) {
      query.eq('is_public', true)
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

    if (!collection.path) {
      return {
        data: [],
        error: null,
      }
    }

    const { data: metaFile, error: metaError } =
      await this.storageService.download(collection.path as string)

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

    const snippets = [
      ...data,
      ...metaData.snippets.filter(
        (metaSnippet: any) =>
          !data.some((dbSnippet: any) => dbSnippet.id === metaSnippet.id),
      ),
    ]

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

  async uploadCollection(payload: any): Promise<any> {
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

    let metaData = null
    const paths = []

    if (collection.path) {
      const { data: metaFile, error: metaFileError } =
        await this.storageService.download(collection.path)

      if (!metaFile || metaFileError) {
        return {
          data: metaFile,
          error: metaFileError,
        }
      }

      metaData = JSON.parse(await metaFile.text())
    }

    for (const added of payload.snippets.add) {
      const code = payload.collectionCode.find(
        (item: any) => item.id === added.id,
      )

      if (!code) {
        continue
      }

      const codeFile = this.prepareCodeFile(
        code.content,
        contentTypes[collection.language],
      )

      paths.push({
        action: 'add',
        path: `${payload.workspaceId}/collections/${collection.slug}/${code.slug}.${collection.language}`,
        file: codeFile,
      })
    }

    for (const removed of payload.snippets.remove) {
      const code = payload.removedCode.find(
        (item: any) => item.id === removed.id,
      )

      if (!code) {
        continue
      }

      paths.push({
        action: 'remove',
        path: `${payload.workspaceId}/collections/${collection.slug}/${code.slug}.${collection.language}`,
      })
    }

    const { data: snippets, error: snippetError } =
      await this.snippetService.getSnippetsForCollection(payload.snippets.add)
    const addedExist = paths.filter((item) => item.action === 'add').length

    if (addedExist && !snippets?.length) {
      return {
        data: snippets,
        error: snippetError || { message: 'No snippets found' },
      }
    }

    metaData = this.prepareMetaData(
      paths.map((item) => ({
        action: item.action,
        path: item.path,
      })),
      snippets,
      payload.snippets.remove,
      metaData,
    )
    paths.push({
      action: 'add',
      type: 'meta',
      path: `${payload.workspaceId}/collections/${collection.slug}/meta.json`,
      file: metaData,
    })

    if (addedExist && snippets?.length) {
      const { data: collectionSnippets, error: collectionSnippetError } =
        await this.supabase
          .from('collection_snippets')
          .insert(
            snippets.map((item: Tables<'snippets'>) => ({
              collection_id: collection.id,
              snippet_id: item.id,
            })),
          )
          .select()

      if (!collectionSnippets?.length || collectionSnippetError) {
        return {
          data: collectionSnippets,
          error: collectionSnippetError || { message: 'No snippets found' },
        }
      }
    }

    if (payload.snippets.remove.length) {
      await this.supabase
        .from('collection_snippets')
        .delete()
        .eq('collection_id', collection.id)
        .in(
          'snippet_id',
          payload.snippets.remove.map((item: any) => item.id),
        )
    }

    const { data, error } = await this.updateCollection(collection.id, {
      path: `${payload.workspaceId}/collections/${collection.slug}/meta.json`,
    })

    for (const path of paths.filter((item) => item.action === 'add')) {
      const { data: file, error: uploadError } = await this.uploadFile(
        path.path,
        path.file as Blob,
        {
          contentType: contentTypes[collection.language],
          upsert: path.type === 'meta' ? true : false,
        },
      )

      if (!file || uploadError) {
        return {
          data: file,
          error: uploadError,
        }
      }
    }

    if (paths.filter((item) => item.action === 'remove').length) {
      const { data: file, error: uploadError } =
        await this.storageService.remove(
          paths
            .filter((item) => item.action === 'remove')
            .map((item) => item.path),
        )

      if (!file || uploadError) {
        return {
          data: file,
          error: uploadError,
        }
      }
    }

    return {
      data,
      error,
    }
  }

  async deleteCollection(id: string, userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('collections')
      .delete()
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single()

    if (!data || error) {
      return {
        data,
        error,
      }
    }

    if (data.path) {
      const { data: metaFile, error: metaFileError } =
        await this.storageService.download(data.path)

      if (!metaFile || metaFileError) {
        return {
          data: metaFile,
          error: metaFileError,
        }
      }

      const metaData = JSON.parse(await metaFile.text())

      await this.removeCollectionFiles([data.path, ...metaData.paths])
    }

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
      await this.storageService.download(collection.path as string)

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

    await this.supabase
      .from('collections')
      .update({
        downloads: collection.downloads + 1,
      })
      .eq('id', collection.id)

    return {
      data: data.signedUrl,
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
    paths: { action: string; path: string }[],
    snippets: any,
    removedSnippets?: any[],
    oldMetaData?: any,
  ): Blob {
    const addedPaths = paths.filter((item) => item.action === 'add')
    const removedPaths = paths.filter((item) => item.action === 'remove')

    let metaData = {
      paths: addedPaths.map((item) => item.path),
      snippets,
    }

    if (oldMetaData) {
      metaData = {
        paths: [
          ...oldMetaData.paths.filter(
            (item: string) =>
              !removedPaths.map((item) => item.path).includes(item),
          ),
          ...addedPaths.map((item) => item.path),
        ],
        snippets: [
          ...oldMetaData.snippets.filter(
            (item: any) =>
              !removedSnippets?.some((removed) => removed.id === item.id),
          ),
          ...snippets,
        ],
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
    await this.storageService.remove(paths)
  }
}
