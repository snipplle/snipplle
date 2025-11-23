import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { CollectionService } from '~~/server/services/collection.service'
import { TagService } from '~~/server/services/tag.service'
import { UsageService } from '~~/server/services/usage.service'

import type { Database } from '~~/server/types/database.types'
import { createCollectionSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { name, language, description, tags, isPublic, workspaceId } =
    await readValidatedBody(event, createCollectionSchema.parse)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const tagService = new TagService(supabase)
  const collectionService = new CollectionService(supabase)
  const usageService = new UsageService(supabase)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data: isExceeded, error: verifyError } =
    await usageService.verifyUsage(
      user?.id,
      isPublic ? 'public_collections' : 'private_collections',
    )

  if (verifyError || isExceeded) {
    throw createError({
      statusCode: 403,
      statusMessage: verifyError?.message || 'Usage limit exceeded',
    })
  }

  const tagIds: string[] = []

  for (const tag of tags || []) {
    const { data: existTag } = await tagService.getTag(tag.name, 'id')

    if (existTag) {
      tagIds.push(existTag.id as string)

      continue
    }

    const { data, error } = await tagService.createTag(tag)

    if (!data || error) {
      throw createError({
        statusCode: 500,
        statusMessage: error?.message,
      })
    }

    tagIds.push(data.id)
  }

  const { data, error } = await collectionService.createCollection(
    {
      name,
      language,
      description,
      isPublic,
    },
    user.id,
    workspaceId,
  )

  if (!data || error) {
    throw createError({
      statusCode: 500,
      statusMessage: error?.message,
    })
  }

  for (const tagId of tagIds) {
    await collectionService.createCollectionTag(data.id, tagId)
  }

  await usageService.incrementUsage(
    user?.id,
    isPublic ? 'public_collections' : 'private_collections',
  )

  return data
})
