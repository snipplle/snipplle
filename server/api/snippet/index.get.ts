import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { SnippetService } from '~~/server/services/snippet.service'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { orderBy, lang, tag, search, page, itemsPerPage, withUrl } =
    getQuery(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const workspaceService = new WorkspaceService(supabase)
  const snippetService = new SnippetService(supabase)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data: workspaceIds, error: workspaceError } =
    await workspaceService.getUserWorkspaces(user?.id)

  if (workspaceError) {
    throw createError({
      statusCode: 500,
      statusMessage: workspaceError.message,
    })
  }

  const { data, count, error } = await snippetService.getSnippets({
    orderBy,
    lang,
    tag,
    search,
    page,
    itemsPerPage,
    workspaceIds,
    withUrl,
  })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return {
    snippets: data,
    count,
  }
})
