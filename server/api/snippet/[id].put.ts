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
      message: 'Unauthorized',
    })
  }

  if (!workspaceId || !snippetCode || !language) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields',
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
      message: error.message,
    })
  }

  return data
})
