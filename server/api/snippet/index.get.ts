import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

import type { Database } from '~~/server/types/database.types'
import { orderByMap } from '~~/server/utils/order'

export default defineEventHandler(async (event) => {
  const { orderBy, lang, tag, search, page, itemsPerPage, withUrl } =
    getQuery(event)
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

  const from = (Number(page) - 1) * Number(itemsPerPage)
  const to = from + Number(itemsPerPage) - 1

  const query = supabase
    .from('snippets')
    .select(
      `
      *,
      snippet_tags!inner(
        tags!inner(name, color)
      )
      ${withUrl === 'true' ? ',snippet_versions(is_latest, path)' : ''}
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
    query.eq('snippet_tags.tags.name', tag as string)
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

  if (withUrl === 'true') {
    const { data: signedUrls, error: signedUrlError } = await supabase.storage
      .from('snippets')
      .createSignedUrls(
        data.map((snippet: any) => {
          return snippet.snippet_versions.find(
            (version: any) => version.is_latest,
          )?.path
        }),
        60,
      )

    if (signedUrlError) {
      throw createError({
        statusCode: 500,
        message: signedUrlError.message,
      })
    }

    data.forEach((snippet: any, index) => {
      snippet.snippetUrl = signedUrls[index]?.signedUrl
    })
  }

  return {
    snippets: data,
    count,
  }
})
