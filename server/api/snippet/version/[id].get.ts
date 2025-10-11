import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { SnippetService } from '~~/server/services/snippet.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { snippetId, workspaceId } = getQuery(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const snippetService = new SnippetService(supabase)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const { data, error } = await snippetService.getSnippetVersion(
    workspaceId as string,
    snippetId as string,
    id,
  )

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  return data
})
