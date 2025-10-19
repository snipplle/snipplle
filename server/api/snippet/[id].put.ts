import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { SnippetService } from '~~/server/services/snippet.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { slug, workspaceId, snippetCode, language } = await readBody(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const snippetService = new SnippetService(supabase)

  if (!user) {
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

  const { data, error } = await snippetService.uploadSnippet({
    workspaceId,
    id,
    slug,
    snippetCode,
    language,
  })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }

  return data
})
