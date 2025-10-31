import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'
import { addMemberSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { workspaceId, email } = await readValidatedBody(
    event,
    addMemberSchema.parse,
  )
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const workspaceService = new WorkspaceService(supabase)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select()
    .eq('email', email)
    .single()

  if (!userData || userError) {
    throw createError({
      statusCode: 400,
      statusMessage: userError?.message || 'User not found',
    })
  }

  const { data, error } = await workspaceService.addMember(
    workspaceId,
    userData.id,
    'member',
  )

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }

  return data
})
