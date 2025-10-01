import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { snippetId } = getQuery(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  if (!snippetId) {
    throw createError({
      statusCode: 400,
      message: 'Snippet ID is required',
    })
  }

  const { data, error } = await supabase
    .from('snippet_versions')
    .select('*')
    .eq('snippet_id', snippetId as string)

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  return data
})
