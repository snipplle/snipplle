import type { SupabaseClient } from '@supabase/supabase-js'
import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'

import { StorageService } from './storage.service'

import { orderByMap } from '../utils/order'
import { beautifyCode } from '../utils/codeFormat'

import type { Database, Tables } from '../types/database.types'
import type { DatabaseResponse, StorageData } from '../types/api.types'

export class SnippetService {
  private storageService: StorageService

  constructor(private supabase: SupabaseClient<Database>) {
    this.storageService = new StorageService(supabase)
  }

  async getSnippets(payload: any): Promise<DatabaseResponse<any[] | null>> {
    const from = (Number(payload.page) - 1) * Number(payload.itemsPerPage)
    const to = from + Number(payload.itemsPerPage) - 1

    const query = this.supabase
      .from('snippets')
      .select(
        `*,
      snippet_tags!inner(
        tags!inner(name, color)
      )`,
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
      query.eq('snippet_tags.tags.name', payload.tag as string)
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

  async getSnippetsForCollection(
    snippets: any[],
  ): Promise<DatabaseResponse<any[] | null>> {
    const { data, error } = await this.supabase
      .from('snippets')
      .select(
        `*,
      snippet_tags!inner(
        tags!inner(*)
      )`,
      )
      .in(
        'id',
        snippets.map((snippet) => snippet.id),
      )

    if (!data || error) {
      return {
        data,
        error,
      }
    }

    for (const snippet of data) {
      const { data: metaFile } = await this.storageService.download(
        'snippets',
        `${snippet.workspace_id}/snippets/${snippet.slug}/meta.json`,
      )

      if (!metaFile) {
        continue
      }

      const metaData = JSON.parse(await metaFile.text())

      snippet.path = metaData?.versions.find(
        (version: any) => version.v === metaData.latest,
      )?.path
    }

    return {
      data,
      error,
    }
  }

  async getSnippet(payload: any): Promise<DatabaseResponse<any | null>> {
    const query = this.supabase
      .from('snippets')
      .select()
      .eq('workspace_id', payload.workspaceId as string)

    if (payload.slug) {
      query.eq('slug', payload.slug)
    }

    if (payload.id) {
      query.eq('id', payload.id)
    }

    const { data, error } = await query.single()

    if (error) {
      return {
        data,
        error,
      }
    }

    if (!payload.withUrl) {
      return {
        data,
        error,
      }
    }

    const { data: metaFile } = await this.storageService.download(
      'snippets',
      `${payload.workspaceId}/snippets/${data.slug}/meta.json`,
    )

    if (!metaFile) {
      return {
        data,
        error,
      }
    }

    const metaData = JSON.parse(await metaFile.text())
    let snippetFile

    if (metaData) {
      const { data: file } = await this.storageService.getSignedUrl(
        metaData.versions.find((version: any) => version.v === metaData.latest)
          ?.path,
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
        name: snippet.name,
        slug: slugify(snippet.name, {
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

    return {
      data,
      error,
    }
  }

  async updateSnippet(
    id: string,
    payload: any,
  ): Promise<DatabaseResponse<Tables<'snippets'> | null>> {
    const { data, error } = await this.supabase
      .from('snippets')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

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

    return {
      data,
      error,
    }
  }

  async getSnippetVersions(
    workspaceId: string,
    snippetId: string,
  ): Promise<any> {
    const { data: snippet, error: snippetError } = await this.getSnippet({
      workspaceId,
      id: snippetId,
    })

    if (snippetError) {
      return {
        data: snippet,
        error: snippetError,
      }
    }

    const { data: metaFile, error: metaFileError } =
      await this.storageService.download(
        'snippets',
        `${snippet.workspace_id}/snippets/${snippet.slug}/meta.json`,
      )

    if (!metaFile || metaFileError) {
      return {
        data: metaFile,
        error: metaFileError,
      }
    }

    const metaData = JSON.parse(await metaFile.text())

    const versions = metaData.versions.map((version: any) => ({
      id: version.id,
      version: version.v,
      is_latest: version.v === metaData.latest,
    }))

    return {
      data: versions,
      error: null,
    }
  }

  async getSnippetVersion(
    workspaceId: string,
    snippetId: string,
    versionId: string,
  ): Promise<any> {
    const { data: snippet, error: snippetError } = await this.getSnippet({
      workspaceId,
      id: snippetId,
    })

    if (snippetError) {
      throw createError({
        statusCode: 400,
        message: snippetError.message,
      })
    }

    const { data: metaFile, error: metaFileError } =
      await this.storageService.download(
        'snippets',
        `${snippet.workspace_id}/snippets/${snippet.slug}/meta.json`,
      )

    if (!metaFile || metaFileError) {
      return {
        data: metaFile,
        error: metaFileError,
      }
    }

    const metaData = JSON.parse(await metaFile.text())
    const version = metaData.versions.find(
      (version: any) => version.id === versionId,
    )

    if (!version) {
      return {
        data: null,
        error: createError({
          statusCode: 400,
          message: 'Version not found',
        }),
      }
    }

    const { data: file } = await this.storageService.getSignedUrl(version.path)

    return {
      data: {
        snippet_file: (file as StorageData)?.signedUrl,
      },
      error: null,
    }
  }

  async uploadSnippet(payload: any): Promise<DatabaseResponse<any | null>> {
    const { data: snippet, error: snippetError } = await this.getSnippet({
      workspaceId: payload.workspaceId,
      id: payload.id,
    })

    if (snippetError) {
      return {
        data: snippet,
        error: snippetError,
      }
    }

    if (!snippet.path) {
      const { data, error } = await this.uploadFirstVersion(payload, snippet)

      return {
        data,
        error,
      }
    }

    const { data, error } = await this.uploadNewVersion(payload, snippet)

    return {
      data,
      error,
    }
  }

  async deleteSnippet(
    id: string,
    userId: string,
  ): Promise<DatabaseResponse<any | null>> {
    const { data, error } = await this.supabase
      .from('snippets')
      .delete()
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single()

    return {
      data,
      error,
    }
  }

  private async uploadFirstVersion(
    payload: any,
    snippet: Tables<'snippets'>,
  ): Promise<any> {
    const latestVersion = 1
    const codeFile = this.prepareCodeFile(
      payload.snippetCode,
      `application/typescript`,
    )

    const { data: file, error: uploadError } = await this.uploadFile(
      `${payload.workspaceId}/snippets/${snippet.slug}/${latestVersion}/index.${snippet.language}`,
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

    const metaData = this.prepareMetaData(latestVersion, file.path)

    const { data: metaFile, error: metaUploadError } = await this.uploadFile(
      `${payload.workspaceId}/snippets/${snippet.slug}/meta.json`,
      metaData,
      {
        contentType: `application/json`,
      },
    )

    if (!metaFile || metaUploadError) {
      await this.removeSnippetFiles([
        `${payload.workspaceId}/snippets/${snippet.slug}/${latestVersion}`,
      ])

      return {
        data: metaFile,
        error: metaUploadError,
      }
    }

    const { data, error } = await this.updateSnippet(payload.id, {
      preview: beautifyCode(payload.snippetCode)
        .split('\n')
        .slice(0, 15)
        .join('\n'),
      path: metaFile.path,
    })

    return {
      data,
      error,
    }
  }

  private async uploadNewVersion(
    payload: any,
    snippet: Tables<'snippets'>,
  ): Promise<any> {
    const { data: metaFile, error: metaFileError } =
      await this.storageService.download(
        'snippets',
        `${payload.workspaceId}/snippets/${snippet.slug}/meta.json`,
      )

    if (!metaFile || metaFileError) {
      return {
        data: metaFile,
        error: metaFileError,
      }
    }

    const metaData = JSON.parse(await metaFile.text())
    const newVersion = metaData.latest + 1

    const codeFile = this.prepareCodeFile(
      payload.snippetCode,
      `application/typescript`,
    )

    const { data: file, error: uploadError } = await this.uploadFile(
      `${payload.workspaceId}/snippets/${snippet.slug}/${newVersion}/index.${snippet.language}`,
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

    const newMetaData = this.prepareMetaData(newVersion, file.path, metaData)

    const { data: newMetaFile, error: metaUploadError } = await this.uploadFile(
      `${payload.workspaceId}/snippets/${snippet.slug}/meta.json`,
      newMetaData,
      {
        upsert: true,
        contentType: `application/json`,
      },
    )

    if (!newMetaFile || metaUploadError) {
      await this.removeSnippetFiles([
        `${payload.workspaceId}/snippets/${snippet.slug}/${newVersion}`,
      ])

      return {
        data: newMetaFile,
        error: metaUploadError,
      }
    }

    const { data, error } = await this.updateSnippet(payload.id, {
      preview: beautifyCode(payload.snippetCode)
        .split('\n')
        .slice(0, 15)
        .join('\n'),
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
    oldMetaData?: any,
  ): Blob {
    let metaData = {
      latest: version,
      versions: [
        {
          id: createId(),
          v: version,
          path,
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
      'snippets',
      path,
      file,
      options,
    )

    return {
      data,
      error,
    }
  }

  private async removeSnippetFiles(paths: string[]): Promise<void> {
    await this.storageService.remove('snippets', [...paths])
  }
}
