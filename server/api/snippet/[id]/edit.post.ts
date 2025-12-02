import { SnippetService } from '~~/server/services/snippet.service'

import { updateSnippetSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { name, description, isPublic } = await readValidatedBody(
    event,
    updateSnippetSchema.parse,
  )
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const snippetService = new SnippetService()

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const data = await snippetService.updateSnippet(id, {
    name,
    description,
    isPublic,
  })

  if (!data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to update snippet',
    })
  }

  return data
})
