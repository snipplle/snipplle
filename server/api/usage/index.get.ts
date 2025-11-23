import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { scope, slug } = getQuery(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data, error } = await supabase.functions.invoke('verify-usage', {
    body: {
      userId: user.id,
      usageKey: scope,
      meta: {
        slug,
      },
    },
  })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return JSON.parse(data)
})
