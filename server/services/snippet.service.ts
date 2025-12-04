import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'

import { WorkspaceService } from './workspace.service'
import { StorageService } from './storage.service'

import { orderByMap } from '../utils/order'
import { contentTypes } from '../utils/codeFormat'

import type { SnippetVersion } from '../types/api.types'
import { snippet, snippetGarbage, snippetTag } from '../db/schema'
import type { InferSelectModel } from 'drizzle-orm'

export class SnippetService {
  private workspaceService: WorkspaceService = new WorkspaceService()
  private storageService: StorageService = new StorageService()
  private db = useDrizzle()

  async getSnippets(payload: any): Promise<{
    data: InferSelectModel<typeof snippet>[]
    count: number
  }> {
    const from = (Number(payload.page) - 1) * Number(payload.itemsPerPage)
    const to = from + Number(payload.itemsPerPage) - 1

    const snippetsData = await this.db.query.snippet.findMany({
      where: (snippet, { and, eq, ilike, inArray, isNotNull }) => {
        const conditions = []

        if (payload.workspaceIds?.length) {
          const ids = payload.workspaceIds.map(
            (workspace: any) => workspace.workspaceId,
          )
          conditions.push(inArray(snippet.workspaceId, ids))
        }

        if (payload.lang) {
          conditions.push(eq(snippet.language, payload.lang))
        }

        if (payload.search) {
          conditions.push(ilike(snippet.name, `%${payload.search}%`))
        }

        if (payload.onlyPublic) {
          conditions.push(eq(snippet.isPublic, true), isNotNull(snippet.path))
        }

        return conditions.length ? and(...conditions) : undefined
      },

      limit: to - from + 1,
      offset: from,

      orderBy: (snippet, { asc, desc }) => {
        const order = orderByMap[payload.orderBy ?? 'name']

        return order.ascending
          ? asc((snippet as any)[order.field])
          : desc((snippet as any)[order.field])
      },

      with: {
        workspace: true,
        snippetTags: {
          with: {
            tag: true,
          },
        },
      },
    })

    const count = !payload.onlyPublic
      ? await this.db.$count(
          snippet,
          inArray(
            snippet.workspaceId,
            payload.workspaceIds.map((workspace: any) => workspace.workspaceId),
          ),
        )
      : await this.db.$count(
          snippet,
          and(eq(snippet.isPublic, true), isNotNull(snippet.path)),
        )

    return {
      data: snippetsData,
      count,
    }
  }

  async getSnippetsForCollection(
    snippets: any[],
  ): Promise<InferSelectModel<typeof snippet>[]> {
    const snippetData = await this.db.query.snippet.findMany({
      where: (snippet, { inArray }) =>
        inArray(
          snippet.id,
          snippets.map((snippet) => snippet.id),
        ),
    })

    for (const snippet of snippetData) {
      if (!snippet.path) {
        continue
      }

      const metaFile = await this.storageService.download(snippet.path)

      if (!metaFile) {
        continue
      }

      const metaData = JSON.parse(metaFile)

      snippet.path = metaData?.versions.find(
        (version: any) => version.v === metaData.latest,
      )?.path
    }

    return snippetData
  }

  async getSnippet(payload: any): Promise<
    | (InferSelectModel<typeof snippet> & {
        snippet_file?: string | null
      })
    | undefined
  > {
    const snippetData = await this.db.query.snippet.findFirst({
      where: (snippet, { and, eq }) => {
        const conditions = []

        if (payload.workspaceId) {
          conditions.push(eq(snippet.workspaceId, payload.workspaceId))
        }

        if (payload.slug) {
          conditions.push(eq(snippet.slug, payload.slug))
        }

        if (payload.id) {
          conditions.push(eq(snippet.id, payload.id))
        }

        return conditions.length ? and(...conditions) : undefined
      },
    })

    if (!payload.withUrl || !snippetData?.path) {
      return snippetData
    }

    const metaFile = await this.storageService.download(snippetData.path)

    if (!metaFile) {
      return snippetData
    }

    const metaData = JSON.parse(metaFile)
    let snippetFile

    if (metaData) {
      const file = await this.storageService.getSignedUrl(
        metaData.versions.find((version: any) => version.v === metaData.latest)
          ?.path,
      )

      snippetFile = file
    }

    return {
      ...snippetData,
      snippet_file: snippetFile,
    }
  }

  async createSnippet(
    payload: any,
    userId: string,
    workspaceId: string,
  ): Promise<InferSelectModel<typeof snippet>> {
    const snippetData = await this.db
      .insert(snippet)
      .values({
        name: payload.name,
        slug: slugify(payload.name, {
          lower: true,
          remove: /[*+~.()'"!:@]/g,
        }),
        language: payload.language,
        description: payload.description,
        isPublic: payload.isPublic,
        createdBy: userId,
        workspaceId: workspaceId,
      })
      .returning()

    return snippetData[0]
  }

  async updateSnippet(
    id: string,
    payload: any,
  ): Promise<InferSelectModel<typeof snippet>> {
    const snippetData = await this.db
      .update(snippet)
      .set(payload)
      .where(eq(snippet.id, id))
      .returning()

    return snippetData[0]
  }

  async createSnippetTag(
    snippetId: string,
    tagId: string,
  ): Promise<InferSelectModel<typeof snippetTag>> {
    const snippetTagData = await this.db
      .insert(snippetTag)
      .values({
        snippetId,
        tagId,
      })
      .returning()

    return snippetTagData[0]
  }

  async getSnippetVersions(
    workspaceId: string,
    snippetId: string,
  ): Promise<SnippetVersion[] | null> {
    const snippetData = await this.getSnippet({
      workspaceId,
      id: snippetId,
    })

    if (!snippetData?.path) {
      return []
    }

    const metaFile = await this.storageService.download(snippetData.path)

    if (!metaFile) {
      return null
    }

    const metaData = JSON.parse(metaFile)

    return metaData.versions.map((version: any) => ({
      id: version.id,
      version: version.v,
      is_latest: version.v === metaData.latest,
    }))
  }

  async getSnippetVersion(
    workspaceId: string,
    snippetId: string,
    versionId: string,
    path?: string,
  ): Promise<string | null> {
    const snippetData = await this.getSnippet({
      workspaceId,
      id: snippetId,
    })

    if (!snippetData && path) {
      return await this.storageService.getSignedUrl(path)
    }

    if (!snippetData?.path) {
      return null
    }

    const metaFile = await this.storageService.download(snippetData.path)

    if (!metaFile) {
      return null
    }

    const metaData = JSON.parse(metaFile)
    const version = metaData.versions.find((version: any) =>
      versionId === 'latest'
        ? version.v === metaData.latest
        : version.id === versionId,
    )

    if (!version) {
      return null
    }

    return await this.storageService.getSignedUrl(version.path)
  }

  async uploadSnippet(
    payload: any,
  ): Promise<InferSelectModel<typeof snippet> | Error | null> {
    const snippetData = await this.getSnippet({
      workspaceId: payload.workspaceId,
      id: payload.id,
    })

    if (!snippetData) {
      return null
    }

    if (!snippetData.path) {
      return await this.uploadFirstVersion(payload, snippetData)
    }

    return await this.uploadNewVersion(payload, snippetData)
  }

  async deleteSnippet(
    id: string,
    userId: string,
  ): Promise<InferSelectModel<typeof snippet> | null> {
    const snippetData = await this.db
      .delete(snippet)
      .where(and(eq(snippet.id, id), eq(snippet.createdBy, userId)))
      .returning()

    if (!snippetData[0] || !snippetData[0].path) {
      return null
    }

    const collectionSnippets = await this.db.query.collectionSnippet.findFirst({
      where: (collectionSnippet, { and, eq }) =>
        and(eq(collectionSnippet.snippetId, id)),
    })

    if (!collectionSnippets) {
      const metaFile = await this.storageService.download(snippetData[0].path)

      if (!metaFile) {
        return null
      }

      const metaData = JSON.parse(metaFile)
      const versionPaths = metaData.versions.map((version: any) => version.path)

      await this.storageService.remove([...versionPaths, snippetData[0].path])

      return snippetData[0]
    }

    await this.db.insert(snippetGarbage).values({
      snippetId: id,
      workspaceId: snippetData[0].workspaceId,
      path: snippetData[0].path,
    })

    return snippetData[0]
  }

  async pullSnippet(
    workspaceId: string,
    snippetSlug: string,
    versionTag: string,
    userId: string,
  ): Promise<string | Error | null> {
    const snippetData = await this.getSnippet({
      workspaceId,
      slug: snippetSlug,
    })

    if (!snippetData) {
      return null
    }

    if (!snippetData.isPublic) {
      const { hasAccess } = await this.workspaceService.checkMember(
        workspaceId,
        userId,
      )

      if (!hasAccess) {
        return createError({
          statusCode: 400,
          message: 'You do not have access to this snippet',
        })
      }
    }

    if (!snippetData.path) {
      return createError({
        statusCode: 400,
        message: 'Snippet has no content yet',
      })
    }

    const metaFile = await this.storageService.download(snippetData.path)

    if (!metaFile) {
      return createError({
        statusCode: 400,
        message: 'Snippet has no content yet',
      })
    }

    const metaData = JSON.parse(metaFile)
    const versionData = metaData.versions.find((version: any) =>
      versionTag === 'latest'
        ? version.v === metaData.latest
        : version.v === Number(versionTag),
    )

    if (!versionData) {
      return createError({
        statusCode: 400,
        message: 'Version not found',
      })
    }

    const file = await this.storageService.getSignedUrl(versionData.path)

    if (!file) {
      return createError({
        statusCode: 400,
        message: 'Version not found',
      })
    }

    await this.db
      .update(snippet)
      .set({
        downloads: snippetData.downloads + 1,
      })
      .where(eq(snippet.id, snippetData.id))

    return file
  }

  async cleanGarbage(): Promise<{ success: boolean }> {
    const garbage = await this.db.query.snippetGarbage.findMany()

    for (const item of garbage) {
      const isUsed = await this.db.query.collectionSnippet.findFirst({
        where: (collectionSnippet, { eq }) =>
          eq(collectionSnippet.snippetId, item.snippetId),
      })

      if (isUsed) {
        continue
      }

      const { success } = await this.removeAllFiles(item.path)

      if (!success) {
        continue
      }

      await this.db.delete(snippetGarbage).where(eq(snippetGarbage.id, item.id))
    }

    return {
      success: true,
    }
  }

  private async uploadFirstVersion(
    payload: any,
    snippetData: InferSelectModel<typeof snippet>,
  ): Promise<InferSelectModel<typeof snippet> | Error> {
    const latestVersion = 1
    const codeFile = this.prepareCodeFile(
      payload.snippetCode,
      contentTypes[snippetData.language!],
    )

    const file = await this.uploadFile(
      `${payload.workspaceId}/snippets/${snippetData.slug}/${latestVersion}/index.${snippetData.language}`,
      codeFile,
      {
        contentType: contentTypes[snippetData.language!],
      },
    )

    if (!file) {
      return createError({
        statusCode: 400,
        message: 'Failed to upload snippet',
      })
    }

    const metaData = this.prepareMetaData(latestVersion, file)

    const metaFile = await this.uploadFile(
      `${payload.workspaceId}/snippets/${snippetData.slug}/meta.json`,
      metaData,
      {
        contentType: contentTypes.json,
      },
    )

    if (!metaFile) {
      await this.removeSnippetFiles(
        payload.workspaceId,
        snippetData,
        latestVersion,
      )

      return createError({
        statusCode: 400,
        message: 'Failed to upload snippet',
      })
    }

    const updatedSnippet = await this.db
      .update(snippet)
      .set({
        preview: payload.snippetCode,
        path: metaFile,
      })
      .where(eq(snippet.id, payload.id))
      .returning()

    return updatedSnippet[0]
  }

  private async uploadNewVersion(
    payload: any,
    snippetData: InferSelectModel<typeof snippet>,
  ): Promise<InferSelectModel<typeof snippet> | Error> {
    const metaFile = await this.storageService.download(snippetData.path!)

    if (!metaFile) {
      return createError({
        statusCode: 400,
        message: 'Failed to upload snippet',
      })
    }

    const metaData = JSON.parse(metaFile)
    const newVersion = metaData.latest + 1

    const codeFile = this.prepareCodeFile(
      payload.snippetCode,
      contentTypes[snippetData.language!],
    )

    const file = await this.uploadFile(
      `${payload.workspaceId}/snippets/${snippetData.slug}/${newVersion}/index.${snippetData.language}`,
      codeFile,
      {
        contentType: contentTypes[snippetData.language!],
      },
    )

    if (!file) {
      return createError({
        statusCode: 400,
        message: 'Failed to upload snippet',
      })
    }

    const newMetaData = this.prepareMetaData(newVersion, file)

    const newMetaFile = await this.uploadFile(
      `${payload.workspaceId}/snippets/${snippetData.slug}/meta.json`,
      newMetaData,
      {
        contentType: contentTypes.json,
      },
    )

    if (!newMetaFile) {
      await this.removeSnippetFiles(
        payload.workspaceId,
        snippetData,
        newVersion,
      )

      return createError({
        statusCode: 400,
        message: 'Failed to upload snippet',
      })
    }

    const updatedSnippet = await this.db
      .update(snippet)
      .set({
        preview: payload.snippetCode,
      })
      .where(eq(snippet.id, payload.id))
      .returning()

    return updatedSnippet[0]
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
  ): Promise<string | null> {
    return await this.storageService.upload(path, file, options)
  }

  private async removeSnippetFiles(
    workspaceId: string,
    snippetData: InferSelectModel<typeof snippet>,
    version: number,
  ): Promise<void> {
    await this.storageService.remove([
      `${workspaceId}/snippets/${snippetData.slug}/${version}/index.${snippetData.language}`,
    ])
  }

  private async removeAllFiles(
    metaPath: string,
  ): Promise<{ success: boolean }> {
    const metaFile = await this.storageService.download(metaPath)

    if (!metaFile) {
      return { success: false }
    }

    const metaData = JSON.parse(metaFile)

    const versionPaths = metaData.versions.map((version: any) => version.path)

    await this.storageService.remove([...versionPaths, metaPath])

    return { success: true }
  }
}
