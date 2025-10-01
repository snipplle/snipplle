import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import slugify from 'slugify'
import { createId } from '@paralleldrive/cuid2'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { name } = await readBody(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      id: createId(),
      name,
      slug: slugify(name, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
      }),
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  await supabase.from('workspace_members').insert({
    id: createId(),
    workspace_id: data.id,
    user_id: user.id,
    role: 'owner',
  })

  await supabase.auth.updateUser({
    data: {
      onboarding_completed: true,
    },
  })

  return data
})
