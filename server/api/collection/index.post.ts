import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { CollectionService } from '~~/server/services/collection.service'
import { TagService } from '~~/server/services/tag.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { name, language, description, tags, isPublic, workspaceId } =
    await readBody(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const tagService = new TagService(supabase)
  const collectionService = new CollectionService(supabase)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const tagIds: string[] = []

  for (const tag of tags) {
    const { data: existTag } = await tagService.getTag(tag.name, 'id')

    if (existTag) {
      tagIds.push(existTag.id as string)

      continue
    }

    const { data, error } = await tagService.createTag(tag)

    if (!data || error) {
      throw createError({
        statusCode: 500,
        message: error?.message,
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
      message: error?.message,
    })
  }

  for (const tagId of tagIds) {
    await collectionService.createCollectionTag(data.id, tagId)
  }

  return data
})
