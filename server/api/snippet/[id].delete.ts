import { SnippetService } from '~~/server/services/snippet.service'
import { UsageService } from '~~/server/services/usage.service'
import { UsageKeys } from '~~/server/types/api.types'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const snippetService = new SnippetService()
  const usageService = new UsageService()

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const deletedSnippet = await snippetService.deleteSnippet(id, session.user.id)

  if (!deletedSnippet) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Snippet not found',
    })
  }

  await usageService.decrementUsage(
    session.user.id,
    deletedSnippet.isPublic
      ? UsageKeys.publicSnippets
      : UsageKeys.privateSnippets,
  )

  return {
    success: true,
  }
})
