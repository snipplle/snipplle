import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { CollectionService } from '~~/server/services/collection.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { slug, workspaceId, snippets, collectionCode } = await readBody(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const collectionService = new CollectionService(supabase)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  if (!workspaceId || !collectionCode || !snippets) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  if (!collectionCode.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Collection code is empty',
    })
  }

  const { data, error } = await collectionService.uploadCollection({
    workspaceId,
    id,
    slug,
    collectionCode,
    snippets,
  })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }

  return data
})
