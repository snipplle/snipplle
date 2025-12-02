import type { InferSelectModel } from 'drizzle-orm'
import type { snippet } from '~~/server/db/schema'
import { SnippetService } from '~~/server/services/snippet.service'
import { WorkspaceService } from '~~/server/services/workspace.service'

export default defineEventHandler(async (event) => {
  const { orderBy, lang, tag, search, page, itemsPerPage } = getQuery(event)
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const workspaceService = new WorkspaceService()
  const snippetService = new SnippetService()

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const workspaces = await workspaceService.getUserWorkspaces(session.user.id)

  if (!workspaces) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get user workspaces',
    })
  }

  const { data, count } = await snippetService.getSnippets({
    orderBy,
    lang,
    tag,
    search,
    page,
    itemsPerPage,
    workspaceIds: workspaces,
  })

  return {
    snippets: data as InferSelectModel<typeof snippet>[],
    count: count as number,
  }
})
