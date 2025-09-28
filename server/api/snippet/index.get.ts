import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }
  
  const { data: workspaceIds, error: workspaceError } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user?.id)

  if (workspaceError) {
    throw createError({
      statusCode: 500,
      message: workspaceError.message,
    })
  }
    
  const { data, error } = await supabase
    .from('snippets')
    .select(`
      *,
      snippet_tags(
        tags(*)
      )
    `)
    .in('workspace_id', workspaceIds.map((workspace) => workspace.workspace_id))

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }

  return data
})