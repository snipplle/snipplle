import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { TagService } from '~~/server/services/tag.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const tagService = new TagService(supabase)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const { data, error } = await tagService.getTags()

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }

  return data
})
