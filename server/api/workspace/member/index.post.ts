import { UsageService } from '~~/server/services/usage.service'
import { WorkspaceService } from '~~/server/services/workspace.service'
import { UsageKeys } from '~~/server/types/api.types'

import { addMemberSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { workspaceId, email } = await readValidatedBody(
    event,
    addMemberSchema.parse,
  )
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const db = useDrizzle()
  const workspaceService = new WorkspaceService()
  const usageService = new UsageService()

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data: isExceeded, error: verifyError } =
    await usageService.verifyUsage(session.user.id, UsageKeys.teamMembers)

  if (verifyError || isExceeded) {
    throw createError({
      statusCode: 403,
      statusMessage: verifyError?.message || 'Usage limit exceeded',
    })
  }

  const existUser = await db.query.user.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  })

  if (!existUser) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User not found',
    })
  }

  const member = await workspaceService.addMember(
    workspaceId,
    existUser.id,
    'member',
  )

  if (!member) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to add member',
    })
  }

  await usageService.incrementUsage(session.user.id, UsageKeys.teamMembers)

  return member
})
