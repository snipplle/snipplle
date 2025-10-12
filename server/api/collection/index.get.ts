import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { CollectionService } from '~~/server/services/collection.service'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { orderBy, lang, tag, search, page, itemsPerPage } = getQuery(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const workspaceService = new WorkspaceService(supabase)
  const collectionService = new CollectionService(supabase)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const { data: workspaceIds, error: workspaceError } =
    await workspaceService.getUserWorkspaces(user?.id)

  if (workspaceError) {
    throw createError({
      statusCode: 500,
      message: workspaceError.message,
    })
  }

  const { data, count, error } = await collectionService.getCollections({
    workspaceIds,
    orderBy,
    lang,
    tag,
    search,
    page,
    itemsPerPage,
  })

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }

  return {
    collections: data,
    count,
  }
})
