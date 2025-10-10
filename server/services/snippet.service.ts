import type { SupabaseClient } from '@supabase/supabase-js'
import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'

import { orderByMap } from '../utils/order'

import type { Database, Tables } from '../types/database.types'
import type {
  DatabaseResponse,
  StorageData,
  SnippetFile,
} from '../types/api.types'
import { StorageService } from './storage.service'

export class SnippetService {
  private storageService: StorageService

  constructor(private supabase: SupabaseClient<Database>) {
    this.storageService = new StorageService(supabase)
  }

  async getSnippets(payload: any): Promise<DatabaseResponse<any[] | null>> {
    const from = (Number(payload.page) - 1) * Number(payload.itemsPerPage)
    const to = from + Number(payload.itemsPerPage) - 1

    let select = `
      *,
      snippet_tags!inner(
        tags!inner(name, color)
      )
    `

    if (payload.withUrl === 'true') {
      select += ',snippet_versions(is_latest, path)'
    }

    const query = this.supabase
      .from('snippets')
      .select(select, { count: 'exact' })
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
      query.eq('snippet_tags.tags.name', payload.tag as string)
    }

    if (payload.search) {
      query.ilike('name', `%${payload.search}%`)
    }

    const { data, count, error } = await query

    console.log(data, count, error)

    if (error) {
      return {
        data: null,
        count: 0,
        error,
      }
    }

    if (payload.withUrl === 'true') {
      const { data: signedUrls, error: signedUrlError } =
        await this.supabase.storage.from('snippets').createSignedUrls(
          data.map((snippet: any) => {
            return snippet.snippet_versions.find(
              (version: any) => version.is_latest,
            )?.path
          }),
          3600,
        )

      if (signedUrlError) {
        throw createError({
          statusCode: 500,
          message: signedUrlError.message,
        })
      }

      data.forEach((snippet: any, index: number) => {
        snippet.snippet_url = signedUrls[index]?.signedUrl
      })
    }

    return {
      data,
      count,
      error,
    }
  }

  async getSnippet(
    slug: string,
    workspaceId: string,
  ): Promise<DatabaseResponse<any | null>> {
    const { data, error } = await this.supabase
      .from('snippets')
      .select('*, snippet_versions(id, version, is_latest, path)')
      .eq('slug', slug)
      .eq('workspace_id', workspaceId as string)
      .single()

    if (error) {
      return {
        data: null,
        error,
      }
    }

    const latestVersion = data.snippet_versions.find(
      (version) => version.is_latest,
    )
    let snippetFile

    if (latestVersion?.path) {
      const { data: file } = await this.storageService.getSignedUrl(
        latestVersion.path,
      )

      snippetFile = (file as StorageData)?.signedUrl
    }

    return {
      data: {
        ...data,
        snippet_file: snippetFile,
      },
      error,
    }
  }

  async createSnippet(
    snippet: any,
    userId: string,
    workspaceId: string,
  ): Promise<DatabaseResponse<Tables<'snippets'> | null>> {
    const { data, error } = await this.supabase
      .from('snippets')
      .insert({
        id: createId(),
        name,
        slug: slugify(name, {
          lower: true,
          remove: /[*+~.()'"!:@]/g,
        }),
        language: snippet.language,
        description: snippet.description,
        is_public: snippet.isPublic,
        created_by: userId,
        workspace_id: workspaceId,
      })
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error,
      }
    }

    return {
      data,
      error,
    }
  }

  async createSnippetTag(
    snippetId: string,
    tagId: string,
  ): Promise<DatabaseResponse<Tables<'snippet_tags'> | null>> {
    const { data, error } = await this.supabase
      .from('snippet_tags')
      .insert({
        snippet_id: snippetId,
        tag_id: tagId,
      })
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error,
      }
    }

    return {
      data,
      error,
    }
  }

  async getSnippetVersion(
    id: string,
  ): Promise<
    DatabaseResponse<(Tables<'snippet_versions'> & SnippetFile) | null>
  > {
    const { data, error } = await this.supabase
      .from('snippet_versions')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      return {
        data: null,
        error,
      }
    }

    let snippetFile: string | undefined

    if (data?.path) {
      const { data: file } = await this.storageService.getSignedUrl(data.path)

      snippetFile = (file as StorageData)?.signedUrl
    }

    return {
      data: {
        ...data,
        snippet_file: snippetFile,
      },
      error,
    }
  }
}
