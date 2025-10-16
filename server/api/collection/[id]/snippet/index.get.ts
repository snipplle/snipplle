import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { CollectionService } from '~~/server/services/collection.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { workspaceId } = getQuery(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const collectionService = new CollectionService(supabase)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const { data, error } = await collectionService.getCollectionSnippets(
    id,
    workspaceId as string,
  )

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  return data
})
