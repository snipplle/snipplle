import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }

  return {
    success: true,
  }
})
