import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import slugify from 'slugify'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { name, description, isPublic } = await readBody(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const { data, error } = await supabase
    .from('snippets')
    .update({
      name,
      slug: slugify(name, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
      }),
      description,
      is_public: isPublic,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  return data
})
