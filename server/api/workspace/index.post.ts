import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { WorkspaceService } from '~~/server/services/workspace.service'

import type { Database } from '~~/server/types/database.types'

export default defineEventHandler(async (event) => {
  const { name } = await readBody(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  const workspaceService = new WorkspaceService(supabase)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const { data, error } = await workspaceService.createWorkspace(name)

  if (!data || error) {
    throw createError({
      statusCode: 400,
      message: error?.message,
    })
  }

  await workspaceService.addMember(data.id, user.id, 'owner')

  await supabase.auth.updateUser({
    data: {
      onboarding_completed: true,
    },
  })

  return data
})
