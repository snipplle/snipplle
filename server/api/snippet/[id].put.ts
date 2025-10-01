import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createId } from '@paralleldrive/cuid2'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { slug, workspaceId, snippetCode, language } = await readBody(event)
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

  const { data: lastVersion } = await supabase
    .from('snippet_versions')
    .update({
      is_latest: false,
    })
    .eq('snippet_id', id)
    .eq('is_latest', true)
    .order('created_at', { ascending: false })
    .select()
    .single()

  let newVersion = 1

  if (lastVersion) {
    newVersion = lastVersion.version + 1
  }

  const { data: file, error: uploadError } = await supabase.storage
    .from('snippets')
    .upload(
      `${workspaceId}/snippets/${slug}/${newVersion}/index.${language}`,
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
      language,
      path: file.path,
    })
    .eq('slug', slug)
    .eq('workspace_id', workspaceId)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  await supabase.from('snippet_versions').insert({
    id: createId(),
    snippet_id: id,
    version: newVersion,
    is_latest: true,
    path: file.path,
  })

  return data
})
