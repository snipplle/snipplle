import { CollectionService } from '~~/server/services/collection.service'
import { TagService } from '~~/server/services/tag.service'
import { UsageService } from '~~/server/services/usage.service'
import { UsageKeys } from '~~/server/types/api.types'

import { createCollectionSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { name, language, description, tags, isPublic, workspaceId } =
    await readValidatedBody(event, createCollectionSchema.parse)
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const tagService = new TagService()
  const collectionService = new CollectionService()
  const usageService = new UsageService()

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data: usageData, error: usageError } = await usageService.verifyUsage(
    session?.user?.id,
    isPublic ? UsageKeys.publicCollections : UsageKeys.privateCollections,
  )

  if (usageError || usageData.isExceeded) {
    throw createError({
      statusCode: 403,
      statusMessage: usageError?.message || 'Usage limit exceeded',
    })
  }

  const tagIds: string[] = []

  for (const tag of tags || []) {
    const existTag = await tagService.getTag(tag.name, 'id')

    if (existTag) {
      tagIds.push(existTag.id as string)

      continue
    }

    const tagData = await tagService.createTag(tag)

    if (!tagData) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create tag',
      })
    }

    tagIds.push(tagData.id)
  }

  const collectionData = await collectionService.createCollection(
    {
      name,
      language,
      description,
      isPublic,
    },
    session?.user?.id,
    workspaceId,
  )

  if (!collectionData) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create collection',
    })
  }

  for (const tagId of tagIds) {
    await collectionService.createCollectionTag(collectionData.id, tagId)
  }

  await usageService.incrementUsage(
    session?.user?.id,
    isPublic ? UsageKeys.publicCollections : UsageKeys.privateCollections,
  )

  return collectionData
})
