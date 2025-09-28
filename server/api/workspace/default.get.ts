import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  const { data: member, error: memberError } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  if (memberError) {
    throw createError({
      statusCode: 400,
      message: memberError.message
    })
  }

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', member.workspace_id)
    .single()

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message
    })
  }

  return data
})