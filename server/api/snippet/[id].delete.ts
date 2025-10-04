import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const { error } = await supabase.from('snippets').delete().eq('id', id)

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  return {
    success: true,
  }
})
