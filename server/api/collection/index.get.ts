import { CollectionService } from '~~/server/services/collection.service'
import { WorkspaceService } from '~~/server/services/workspace.service'

export default defineEventHandler(async (event) => {
  const { orderBy, lang, tag, search, page, itemsPerPage } = getQuery(event)
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const workspaceService = new WorkspaceService()
  const collectionService = new CollectionService()

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const workspaces = await workspaceService.getUserWorkspaces(session?.user?.id)

  if (!workspaces) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get user workspaces',
    })
  }

  const { data, count } = await collectionService.getCollections({
    workspaceIds: workspaces,
    orderBy,
    lang,
    tag,
    search,
    page,
    itemsPerPage,
  })

  return {
    collections: data,
    count,
  }
})
