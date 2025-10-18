import { createClient } from '@supabase/supabase-js'
import { CollectionService } from '~~/server/services/collection.service'
import { SnippetService } from '~~/server/services/snippet.service'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const token = event.node.req.headers['authorization']?.replace('Bearer ', '')
  const { snippetPath, collectionPath } = await readBody(event)
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
  const collectionService = new CollectionService(supabase)

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Missing authorization token',
    })
  }

  const { data: auth, error: authError } = await supabase.auth.getUser(token)

  if (!auth?.user || authError) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  if (snippetPath) {
    const [workspaceSlug, snippetPart] = snippetPath.split('/')
    const [snippetSlug, version] = snippetPart.split('@')

    const { data: workspace, error: workspaceError } =
      await workspaceService.getWorkspaceBySlug(workspaceSlug)

    if (!workspace || workspaceError) {
      throw createError({
        statusCode: 400,
        message: workspaceError?.message,
      })
    }

    const { data, error } = await snippetService.pullSnippet(
      workspace.id,
      snippetSlug,
      version || 'latest',
    )

    if (error) {
      throw createError({
        statusCode: 400,
        message: error.message,
      })
    }

    return {
      path: data,
    }
  }

  const [workspaceSlug, collectionSlug] = collectionPath.split('/')

  const { data: workspace, error: workspaceError } =
    await workspaceService.getWorkspaceBySlug(workspaceSlug)

  if (!workspace || workspaceError) {
    throw createError({
      statusCode: 400,
      message: workspaceError?.message,
    })
  }

  const { data, error } = await collectionService.pullCollection(
    workspace.id,
    collectionSlug,
  )

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  return {
    path: data,
  }
})
