import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { SnippetService } from '~~/server/services/snippet.service'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { orderBy, lang, tag, search, page, itemsPerPage, withUrl } =
    getQuery(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const workspaceService = new WorkspaceService(supabase)
  const snippetService = new SnippetService(supabase)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const { data: workspaces, error: workspaceError } =
    await workspaceService.getWorkspaces('workspace_id', user?.id)

  if (workspaceError) {
    throw createError({
      statusCode: 500,
      message: workspaceError.message,
    })
  }

  const { data, count, error } = await snippetService.getSnippets({
    orderBy,
    lang,
    tag,
    search,
    page,
    itemsPerPage,
    workspaces,
  })

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }

  if (withUrl === 'true') {
    const { data: signedUrls, error: signedUrlError } = await supabase.storage
      .from('snippets')
      .createSignedUrls(
        data.map((snippet: any) => {
          return snippet.snippet_versions.find(
            (version: any) => version.is_latest,
          )?.path
        }),
        3600,
      )

    if (signedUrlError) {
      throw createError({
        statusCode: 500,
        message: signedUrlError.message,
      })
    }

    data.forEach((snippet: any, index) => {
      snippet.snippet_url = signedUrls[index]?.signedUrl
    })
  }

  return {
    snippets: data,
    count,
  }
})
