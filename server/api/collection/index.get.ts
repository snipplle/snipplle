import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { orderBy, lang, tag, search, page, itemsPerPage } = getQuery(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

  if (!user) {
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

  const from = (Number(page) - 1) * Number(itemsPerPage)
  const to = from + Number(itemsPerPage) - 1

  const query = supabase
    .from('collections')
    .select(
      `
      *,
      collection_tags!inner(
        tags!inner(name, color)
      )
    `,
      { count: 'exact' },
    )
    .in(
      'workspace_id',
      workspaceIds.map((workspace) => workspace.workspace_id),
    )
    .range(from, to)

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
    query.eq('collection_tags.tags.name', tag as string)
  }

  if (search) {
    query.ilike('name', `%${search}%`)
  }

  const { data, count, error } = await query

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }

  return {
    collections: data,
    count,
  }
})
