import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const { id: slug } = await getRouterParams(event)
  const { workspaceId, snippetCode, language } = await readBody(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

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

  const { data: file, error: uploadError } = await supabase.storage
    .from('snippets')
    .upload(
      `${workspaceId}/snippets/${slug}/latest/index.${language}`,
      snippetCode,
      {
        contentType: 'application/typescript',
      },
    )

  if (uploadError) {
    throw createError({
      statusCode: 400,
      message: uploadError.message,
    })
  }

  const { data, error } = await supabase
    .from('snippets')
    .update({
      preview: snippetCode,
      path: file.path,
    })
    .eq('slug', slug)
    .eq('workspace_id', workspaceId)
    .single()

  if (error) {
    throw createError({
      statusCode: 404,
      message: 'Snippet not found',
    })
  }

  return data
})
