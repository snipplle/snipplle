import slugify from 'slugify'

import { StorageService } from './storage.service'
import { SnippetService } from './snippet.service'

import { contentTypes } from '../utils/codeFormat'

import { collection, collectionSnippet, collectionTag } from '../db/schema'
import type { InferSelectModel } from 'drizzle-orm'

export class CollectionService {
  private db = useDrizzle()
  private storageService: StorageService
  private snippetService: SnippetService

  constructor() {
    this.storageService = new StorageService()
    this.snippetService = new SnippetService()
  }

  async getCollections(payload: any): Promise<{
    data: InferSelectModel<typeof collection>[]
    count: number
  }> {
    const from = (Number(payload.page) - 1) * Number(payload.itemsPerPage)
    const to = from + Number(payload.itemsPerPage) - 1

    const collectionsData = await this.db.query.collection.findMany({
      where: (collection, { and, eq, ilike, inArray, isNotNull }) => {
        const conditions = []

        if (payload.workspaceIds?.length) {
          const ids = payload.workspaceIds.map(
            (workspace: any) => workspace.workspaceId,
          )
          conditions.push(inArray(collection.workspaceId, ids))
        }

        if (payload.lang) {
          conditions.push(eq(collection.language, payload.lang))
        }

        if (payload.search) {
          conditions.push(ilike(collection.name, `%${payload.search}%`))
        }

        if (payload.onlyPublic) {
          conditions.push(
            eq(collection.isPublic, true),
            isNotNull(collection.path),
          )
        }

        return conditions.length ? and(...conditions) : undefined
      },

      limit: to - from + 1,
      offset: from,

      orderBy: (collection, { asc, desc }) => {
        const order = orderByMap[payload.orderBy ?? 'name']

        return order.ascending
          ? asc((collection as any)[order.field])
          : desc((collection as any)[order.field])
      },

      with: {
        workspace: true,
        collectionTags: {
          with: {
            tag: true,
          },
        },
      },
    })

    const count = !payload.onlyPublic
      ? await this.db.$count(
          collection,
          inArray(
            collection.workspaceId,
            payload.workspaceIds.map((workspace: any) => workspace.workspaceId),
          ),
        )
      : await this.db.$count(
          collection,
          and(eq(collection.isPublic, true), isNotNull(collection.path)),
        )

    return {
      data: collectionsData,
      count,
    }
  }

  async getCollection(
    payload: any,
  ): Promise<InferSelectModel<typeof collection> | undefined> {
    return await this.db.query.collection.findFirst({
      where: (collection, { and, eq }) => {
        const conditions = []

        if (payload.workspaceId) {
          conditions.push(eq(collection.workspaceId, payload.workspaceId))
        }

        if (payload.slug) {
          conditions.push(eq(collection.slug, payload.slug))
        }

        if (payload.id) {
          conditions.push(eq(collection.id, payload.id))
        }

        return conditions.length ? and(...conditions) : undefined
      },
    })
  }

  async getCollectionSnippets(id: string, workspaceId: string): Promise<any> {
    const collection = await this.getCollection({
      id,
      workspaceId,
    })

    if (!collection) {
      return {
        data: collection,
        error: 'Collection not found',
      }
    }

    if (!collection.path) {
      return {
        data: [],
        error: null,
      }
    }

    const metaFile = await this.storageService.download(
      collection.path as string,
    )

    if (!metaFile) {
      return {
        data: metaFile,
        error: 'Failed to download collection meta file',
      }
    }

    const metaData = JSON.parse(metaFile)

    const snippetsData = await this.snippetService.getSnippetsForCollection(
      metaData.snippets,
    )

    if (!snippetsData.length) {
      return {
        data: snippetsData,
        error: 'Failed to get collection snippets',
      }
    }

    const snippets = [
      ...snippetsData,
      ...metaData.snippets.filter(
        (metaSnippet: any) =>
          !snippetsData.some(
            (dbSnippet: any) => dbSnippet.id === metaSnippet.id,
          ),
      ),
    ]

    return snippets
  }

  async createCollection(
    payload: any,
    userId: string,
    workspaceId: string,
  ): Promise<InferSelectModel<typeof collection>> {
    const snippetData = await this.db
      .insert(collection)
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

  async updateCollection(
    id: string,
    payload: any,
  ): Promise<InferSelectModel<typeof collection>> {
    const collectionData = await this.db
      .update(collection)
      .set(payload)
      .where(eq(collection.id, id))
      .returning()

    return collectionData[0]
  }

  async createCollectionTag(
    collectionId: string,
    tagId: string,
  ): Promise<InferSelectModel<typeof collectionTag>> {
    const collectionTagData = await this.db
      .insert(collectionTag)
      .values({
        collectionId: collectionId,
        tagId: tagId,
      })
      .returning()

    return collectionTagData[0]
  }

  async uploadCollection(
    payload: any,
  ): Promise<InferSelectModel<typeof collection> | null> {
    const collectionData = await this.getCollection({
      workspaceId: payload.workspaceId,
      id: payload.id,
    })

    if (!collectionData) {
      return null
    }

    let metaData = null
    const paths = []

    if (collectionData.path) {
      const metaFile = await this.storageService.download(collectionData.path)

      if (!metaFile) {
        return null
      }

      metaData = JSON.parse(metaFile)
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
        contentTypes[collectionData.language],
      )

      paths.push({
        action: 'add',
        path: `${payload.workspaceId}/collections/${collectionData.slug}/${code.slug}.${collectionData.language}`,
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
        path: `${payload.workspaceId}/collections/${collectionData.slug}/${code.slug}.${collectionData.language}`,
      })
    }

    const snippets = await this.snippetService.getSnippetsForCollection(
      payload.snippets.add,
    )
    const addedExist = paths.filter((item) => item.action === 'add').length

    if (addedExist && !snippets?.length) {
      return null
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
      path: `${payload.workspaceId}/collections/${collectionData.slug}/meta.json`,
      file: metaData,
    })

    if (addedExist && snippets?.length) {
      const collectionSnippets = await this.db
        .insert(collectionSnippet)
        .values(
          snippets.map((item) => ({
            collectionId: collectionData.id,
            snippetId: item.id,
          })),
        )
        .returning()

      if (!collectionSnippets?.length) {
        return null
      }
    }

    if (payload.snippets.remove.length) {
      await this.db.delete(collectionSnippet).where(
        and(
          eq(collectionSnippet.collectionId, collectionData.id),
          inArray(
            collectionSnippet.snippetId,
            payload.snippets.remove.map((item: any) => item.id),
          ),
        ),
      )
    }

    const updatedCollection = await this.updateCollection(collectionData.id, {
      path: `${payload.workspaceId}/collections/${collectionData.slug}/meta.json`,
    })

    for (const path of paths.filter((item) => item.action === 'add')) {
      const file = await this.uploadFile(path.path, path.file as Blob, {
        contentType: contentTypes[collectionData.language],
      })

      if (!file) {
        return null
      }
    }

    if (paths.filter((item) => item.action === 'remove').length) {
      await this.storageService.remove(
        paths
          .filter((item) => item.action === 'remove')
          .map((item) => item.path),
      )
    }

    return updatedCollection
  }

  async deleteCollection(
    id: string,
    userId: string,
  ): Promise<InferSelectModel<typeof collection> | null> {
    const collectionData = await this.db
      .delete(collection)
      .where(and(eq(collection.id, id), eq(collection.createdBy, userId)))
      .returning()

    if (!collectionData?.length) {
      return null
    }

    if (collectionData[0].path) {
      const metaFile = await this.storageService.download(
        collectionData[0].path,
      )

      if (!metaFile) {
        return null
      }

      const metaData = JSON.parse(metaFile)

      await this.removeCollectionFiles([
        collectionData[0].path,
        ...metaData.paths,
      ])
    }

    return collectionData[0]
  }

  async pullCollection(
    workspaceId: string,
    collectionSlug: string,
  ): Promise<string | null> {
    const collectionData = await this.getCollection({
      workspaceId,
      slug: collectionSlug,
    })

    if (!collectionData) {
      return null
    }

    const metaFile = await this.storageService.download(
      collectionData.path as string,
    )

    if (!metaFile) {
      return null
    }

    const metaData = JSON.parse(metaFile)

    const file = await this.storageService.getSignedUrl(metaData.path)

    if (!file) {
      return null
    }

    await this.db
      .update(collection)
      .set({
        downloads: collectionData.downloads + 1,
      })
      .where(eq(collection.id, collectionData.id))

    return file
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
  ): Promise<string | null> {
    return await this.storageService.upload(path, file, options)
  }

  private async removeCollectionFiles(paths: string[]): Promise<void> {
    await this.storageService.remove(paths)
  }
}
