import { createClient } from '@supabase/supabase-js'
import { SnippetService } from '~~/server/services/snippet.service'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const token = event.node.req.headers['authorization']?.replace('Bearer ', '')
  const { snippet } = getQuery(event)
  const supabase = await createClient<Database>(
    runtimeConfig.SUPABASE_URL,
    runtimeConfig.SUPABASE_KEY,
    {
      global: {
        headers: {
          Authorization: event.node.req.headers['authorization'] || '',
        },
      },
    },
  )
  const workspaceService = new WorkspaceService(supabase)
  const snippetService = new SnippetService(supabase)

  if (!token) {
    return {
      error: true,
      statusCode: 401,
      statusMessage: 'Missing authorization token',
    }
  }

  const { data: auth, error: authError } = await supabase.auth.getUser(token)

  if (!auth?.user || authError) {
    return {
      error: true,
      statusCode: 401,
      statusMessage: 'Unauthorized',
    }
  }

  const [workspaceSlug, snippetSlug] = (snippet as string).split('/')

  const { data: workspace, error: workspaceError } =
    await workspaceService.getWorkspaceBySlug(workspaceSlug)

  if (!workspace || workspaceError) {
    return {
      error: true,
      statusCode: 400,
      statusMessage: workspaceError?.message,
    }
  }

  const { data: snippetData, error: snippetError } =
    await snippetService.getSnippet({
      workspaceId: workspace.id,
      slug: snippetSlug,
    })

  if (!snippetData || snippetError) {
    return {
      error: true,
      statusCode: 400,
      statusMessage: snippetError?.message,
    }
  }

  if (!snippetData.is_public) {
    const { hasAccess } = await workspaceService.checkMember(
      workspace.id,
      auth.user.id,
    )

    if (!hasAccess) {
      return {
        error: true,
        statusCode: 400,
        statusMessage: 'You do not have access to this snippet',
      }
    }
  }

  const { data, error } = await snippetService.getSnippetVersions(
    workspace.id,
    snippetData.id,
  )

  if (error) {
    return {
      error: true,
      statusCode: 400,
      statusMessage: error.message,
    }
  }

  return data
})
