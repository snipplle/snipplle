import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { SnippetService } from '~~/server/services/snippet.service'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { snippetPath } = await readBody(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const workspaceService = new WorkspaceService(supabase)
  const snippetService = new SnippetService(supabase)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const [workspaceSlug, snippetPart] = snippetPath.split('/')
  const [snippetSlug, version] = snippetPart.split('@')

  const { data: workspace, error: workspaceError } =
    await workspaceService.getWorkspaceBySlug(workspaceSlug)

  if (!workspace || workspaceError) {
    throw createError({
      statusCode: 400,
      message: workspaceError?.message,
    })
  }

  const { data: snippet, error: snippetError } =
    await snippetService.getSnippet({
      workspaceId: workspace.id,
      slug: snippetSlug,
    })

  if (snippetError) {
    throw createError({
      statusCode: 400,
      message: snippetError.message,
    })
  }

  const { data, error } = await snippetService.pullSnippet(
    snippet.path,
    version || 'latest',
  )

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  return {
    snippetPath: data,
  }
})
