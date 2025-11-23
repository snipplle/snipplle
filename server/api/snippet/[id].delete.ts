import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { SnippetService } from '~~/server/services/snippet.service'
import { UsageService } from '~~/server/services/usage.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const snippetService = new SnippetService(supabase)
  const usageService = new UsageService(supabase)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data, error } = await snippetService.deleteSnippet(id, user.id)

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }

  await usageService.decrementUsage(
    user.id,
    data?.is_public ? 'public_snippets' : 'private_snippets',
  )

  return {
    success: true,
  }
})
