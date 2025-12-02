import { SnippetService } from '~~/server/services/snippet.service'
import { UsageService } from '~~/server/services/usage.service'
import { UsageKeys } from '~~/server/types/api.types'

import { uploadSnippetSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { slug, workspaceId, snippetCode, language } = await readValidatedBody(
    event,
    uploadSnippetSchema.parse,
  )
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

  if (!workspaceId || !snippetCode || !language) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  if (!snippetCode.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Snippet code is empty',
    })
  }

  const { data: isExceeded, error: verifyError } =
    await usageService.verifyUsage(session.user.id, UsageKeys.snippetVersions, {
      slug,
    })

  if (verifyError || isExceeded) {
    throw createError({
      statusCode: 403,
      statusMessage: verifyError?.message || 'Usage limit exceeded',
    })
  }

  const updatedSnippet = await snippetService.uploadSnippet({
    workspaceId,
    id,
    slug,
    snippetCode,
    language,
  })

  if (!updatedSnippet || updatedSnippet instanceof Error) {
    throw createError({
      statusCode: 400,
      statusMessage: updatedSnippet?.message || 'Failed to upload snippet',
    })
  }

  return updatedSnippet
})
