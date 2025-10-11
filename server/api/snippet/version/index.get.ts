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

  const { data: snippet, error: snippetError } = await supabase
    .from('snippets')
    .select('*')
    .eq('id', snippetId as string)
    .single()

  if (snippetError) {
    throw createError({
      statusCode: 400,
      message: snippetError.message,
    })
  }

  const { data: metaFile, error: metaFileError } = await supabase.storage
    .from('snippets')
    .download(`${snippet.workspace_id}/snippets/${snippet.slug}/meta.json`)

  if (metaFileError) {
    throw createError({
      statusCode: 400,
      message: metaFileError.message,
    })
  }

  const metaData = JSON.parse(await metaFile.text())

  const versions = metaData.versions.map((version: any) => ({
    id: version.id,
    version: version.v,
    is_latest: version.v === metaData.latest,
  }))

  return versions
})
