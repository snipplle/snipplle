import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import type { Database } from '~~/server/types/database.types'

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
    .from('collections')
    .select(`*, collection_versions(id, version, is_latest, path)`)
    .eq('slug', slug)
    .eq('workspace_id', workspaceId as string)
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  const { data: collectionSnippets, error: collectionSnippetsError } =
    await supabase
      .from('collection_versions')
      .select(
        `snippet_versions(is_latest, path, snippets(*, snippet_tags!inner(
        tags!inner(name, color)
      )))`,
      )
      .eq('collection_id', data.id)
      .eq('is_latest', true)
      .single()

  if (collectionSnippetsError) {
    throw createError({
      statusCode: 500,
      message: collectionSnippetsError.message,
    })
  }

  const { data: signedUrls, error: signedUrlError } = await supabase.storage
    .from('snippets')
    .createSignedUrls(
      collectionSnippets.snippet_versions.map((snippet: any) => {
        return snippet.path
      }),
      3600,
    )

  if (signedUrlError) {
    throw createError({
      statusCode: 500,
      message: signedUrlError.message,
    })
  }

  collectionSnippets.snippet_versions.forEach((snippet: any, index) => {
    snippet.snippets.snippet_url = signedUrls[index]?.signedUrl
  })

  return {
    ...data,
    snippets:
      collectionSnippets?.snippet_versions.map((snippet) => snippet.snippets) ||
      [],
  }
})
