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

  const { data, error } = await supabase
    .from('snippet_versions')
    .select('path')
    .eq('id', id)
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  let snippetFile

  if (data?.path) {
    const { data: file } = await supabase.storage
      .from('snippets')
      .createSignedUrl(data.path, 60)

    snippetFile = file?.signedUrl
  }

  return {
    ...data,
    snippetFile,
  }
})
