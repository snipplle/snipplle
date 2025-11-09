import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { CollectionService } from '~~/server/services/collection.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { id: slug } = await getRouterParams(event)
  const { workspaceId } = getQuery(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const collectionService = new CollectionService(supabase)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data, error } = await collectionService.getCollection({
    workspaceId,
    slug,
  })

  if (!data || error) {
    throw createError({
      statusCode: 400,
      statusMessage: error?.message,
    })
  }

  const { data: collectionSnippets } =
    await collectionService.getCollectionSnippets(
      data.id,
      workspaceId as string,
    )

  return {
    ...data,
    snippets: collectionSnippets,
  }
})
