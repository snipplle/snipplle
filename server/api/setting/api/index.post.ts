import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createId } from '@paralleldrive/cuid2'
import { randomBytes } from 'crypto'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { workspaceId, name } = await readBody(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const rawKey = `sk-${randomBytes(16).toString('hex')}`

  const { error } = await supabase
    .from('api_tokens')
    .insert({
      id: createId(),
      user_id: user.id,
      workspace_id: workspaceId,
      name,
      token: rawKey,
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return rawKey
})
