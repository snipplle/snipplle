import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createId } from '@paralleldrive/cuid2'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { slug, workspaceId, snippets, collectionCode, language } =
    await readBody(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  if (!workspaceId || !collectionCode || !snippets || !language) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields',
    })
  }

  const { data: lastVersion } = await supabase
    .from('collection_versions')
    .update({
      is_latest: false,
    })
    .eq('collection_id', id)
    .eq('is_latest', true)
    .order('created_at', { ascending: false })
    .select()
    .single()

  let newVersion = 1

  if (lastVersion) {
    newVersion = lastVersion.version + 1
  }

  const { data: file, error: uploadError } = await supabase.storage
    .from('collections')
    .upload(
      `${workspaceId}/collections/${slug}/${newVersion}/index.${language}`,
      collectionCode,
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
    .from('collections')
    .update({
      language,
    })
    .eq('slug', slug)
    .eq('workspace_id', workspaceId)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }

  const { data: collectionVersion, error: collectionVersionError } =
    await supabase
      .from('collection_versions')
      .insert({
        id: createId(),
        collection_id: id,
        version: newVersion,
        is_latest: true,
        path: file.path,
      })
      .select('id')
      .single()

  if (collectionVersionError) {
    throw createError({
      statusCode: 500,
      message: collectionVersionError.message,
    })
  }

  for (const snippet of snippets) {
    const { data: snippetVersion, error: snippetVersionError } = await supabase
      .from('snippet_versions')
      .select('id')
      .eq('snippet_id', snippet.id)
      .eq('is_latest', true)
      .single()

    if (snippetVersionError) {
      throw createError({
        statusCode: 500,
        message: snippetVersionError.message,
      })
    }

    const { error } = await supabase.from('collection_snippets').insert({
      collection_version_id: collectionVersion.id,
      snippet_version_id: snippetVersion.id,
    })

    console.log(error)
  }

  return data
})
