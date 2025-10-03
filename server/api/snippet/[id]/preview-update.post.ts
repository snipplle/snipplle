import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { previewMode } = await readBody(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const { data, error } = await supabase
    .from('snippets')
    .update({ preview_mode: previewMode })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  return data
})
