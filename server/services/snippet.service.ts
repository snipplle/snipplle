import type { SupabaseClient } from '@supabase/supabase-js'
import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'

import { StorageService } from './storage.service'

import { orderByMap } from '../utils/order'
import { contentTypes } from '../utils/codeFormat'

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
      ${
        payload.tag
          ? `snippet_tags!inner(tags!inner(name, color))`
          : `snippet_tags(
        tags(name, color)
      )`
      }`,
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
      query.eq('snippet_tags.tags.name', payload.tag as string)
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

  async getSnippetsForCollection(
    snippets: any[],
  ): Promise<DatabaseResponse<any[] | null>> {
    const { data, error } = await this.supabase
      .from('snippets')
      .select()
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
      if (!snippet.path) {
        continue
      }

      const { data: metaFile } = await this.storageService.download(
        snippet.path,
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

    if (!payload.withUrl || !data.path) {
      return {
        data,
        error,
      }
    }

    const { data: metaFile } = await this.storageService.download(data.path)

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

    if (!snippet.path) {
      return {
        data: [],
        error: null,
      }
    }

    const { data: metaFile, error: metaFileError } =
      await this.storageService.download(snippet.path)

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
      return {
        data: snippet,
        error: snippetError,
      }
    }

    const { data: metaFile, error: metaFileError } =
      await this.storageService.download(snippet.path)

    if (!metaFile || metaFileError) {
      return {
        data: metaFile,
        error: metaFileError,
      }
    }

    const metaData = JSON.parse(await metaFile.text())
    const version = metaData.versions.find((version: any) =>
      versionId === 'latest'
        ? version.v === metaData.latest
        : version.id === versionId,
    )

    if (!version) {
      return {
        data: null,
        error: createError({
          statusCode: 400,
          statusMessage: 'Version not found',
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

  async deleteSnippet(id: string, userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('snippets')
      .delete()
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single()

    if (!data || !data.path || error) {
      return {
        data,
        error,
      }
    }

    const { data: collectionSnippets } = await this.supabase
      .from('collection_snippets')
      .select()
      .eq('snippet_id', id)
      .single()

    if (!collectionSnippets) {
      const { data: metaFile, error: metaFileError } =
        await this.storageService.download(data.path)

      if (!metaFile || metaFileError) {
        return {
          data: metaFile,
          error: metaFileError,
        }
      }

      const metaData = JSON.parse(await metaFile.text())

      const versionPaths = metaData.versions.map((version: any) => version.path)

      await this.storageService.remove([...versionPaths, data.path])

      return {
        data,
        error: null,
      }
    }

    await this.supabase.from('snippet_garbage').insert({
      id: createId(),
      snippet_id: id,
      workspace_id: data.workspace_id,
      path: data.path,
    })

    return {
      data,
      error,
    }
  }

  async pullSnippet(
    workspaceId: string,
    snippetSlug: string,
    versionTag: string,
  ): Promise<any> {
    const { data: snippet, error: snippetError } = await this.getSnippet({
      workspaceId,
      slug: snippetSlug,
    })

    if (snippetError) {
      throw createError({
        statusCode: 400,
        message: snippetError.message,
      })
    }

    const { data: metaFile, error: metaFileError } =
      await this.storageService.download(snippet.path)

    if (!metaFile || metaFileError) {
      return {
        data: metaFile,
        error: metaFileError,
      }
    }

    const metaData = JSON.parse(await metaFile.text())
    const versionData = metaData.versions.find((version: any) =>
      versionTag === 'latest'
        ? version.v === metaData.latest
        : version.v === Number(versionTag),
    )

    if (!versionData) {
      return {
        data: null,
        error: createError({
          statusCode: 400,
          message: 'Version not found',
        }),
      }
    }

    const { data, error } = await this.storageService.getSignedUrl(
      versionData.path,
    )

    if (!data || error) {
      return {
        data,
        error: error,
      }
    }

    await this.supabase
      .from('snippets')
      .update({
        downloads: snippet.downloads + 1,
      })
      .eq('id', snippet.id)

    return {
      data: data.signedUrl,
      error: null,
    }
  }

  private async uploadFirstVersion(
    payload: any,
    snippet: Tables<'snippets'>,
  ): Promise<any> {
    const latestVersion = 1
    const codeFile = this.prepareCodeFile(
      payload.snippetCode,
      contentTypes[snippet.language!],
    )

    const { data: file, error: uploadError } = await this.uploadFile(
      `${payload.workspaceId}/snippets/${snippet.slug}/${latestVersion}/index.${snippet.language}`,
      codeFile,
      {
        contentType: contentTypes[snippet.language!],
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
        contentType: contentTypes.json,
      },
    )

    if (!metaFile || metaUploadError) {
      await this.removeSnippetFiles(payload.workspaceId, snippet, latestVersion)

      return {
        data: metaFile,
        error: metaUploadError,
      }
    }

    const { data, error } = await this.updateSnippet(payload.id, {
      preview: payload.snippetCode,
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
      await this.storageService.download(snippet.path!)

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
      contentTypes[snippet.language!],
    )

    const { data: file, error: uploadError } = await this.uploadFile(
      `${payload.workspaceId}/snippets/${snippet.slug}/${newVersion}/index.${snippet.language}`,
      codeFile,
      {
        contentType: contentTypes[snippet.language!],
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
      snippet.path!,
      newMetaData,
      {
        upsert: true,
        contentType: contentTypes.json,
      },
    )

    if (!newMetaFile || metaUploadError) {
      await this.removeSnippetFiles(payload.workspaceId, snippet, newVersion)

      return {
        data: newMetaFile,
        error: metaUploadError,
      }
    }

    const { data, error } = await this.updateSnippet(payload.id, {
      preview: payload.snippetCode,
    })

    return {
      data,
      error,
    }
  }

  private prepareCodeFile(code: string, contentType: string): Blob {
    return new Blob([code], {
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

  private async removeSnippetFiles(
    workspaceId: string,
    snippet: Tables<'snippets'>,
    version: number,
  ): Promise<void> {
    await this.storageService.remove([
      `${workspaceId}/snippets/${snippet.slug}/${version}/index.${snippet.language}`,
    ])
  }
}
