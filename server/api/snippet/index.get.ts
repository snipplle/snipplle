import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import type { Database } from '~~/server/types/database.types'
import { orderByMap } from '~~/server/utils/order'

export default defineEventHandler(async (event) => {
  const { orderBy, lang, tag } = getQuery(event)
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

  const query = supabase
    .from('snippets')
    .select(
      `
      *,
      snippet_tags!inner(
        tags!inner(name, color)
      )
    `,
    )
    .in(
      'workspace_id',
      workspaceIds.map((workspace) => workspace.workspace_id),
    )

  if (orderBy) {
    const order = orderByMap[orderBy as string]

    query.order(order.field, {
      ascending: order.ascending,
    })
  }

  if (lang) {
    query.eq('language', lang as string)
  }

  if (tag) {
    query.eq('snippet_tags.tags.name', tag as string)
  }

  const { data, error } = await query

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }

  return data
})
