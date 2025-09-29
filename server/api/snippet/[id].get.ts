import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const { id: slug } = await getRouterParams(event)
  const { workspaceId } = getQuery(event)
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
    .select('*')
    .eq('slug', slug)
    .eq('workspace_id', workspaceId as string)
    .single()

  if (error) {
    throw createError({
      statusCode: 404,
      message: 'Snippet not found',
    })
  }

  let snippetFile

  if (data.path) {
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
