import { UsageService } from '~~/server/services/usage.service'
import type { UsageKeys } from '~~/server/types/api.types'

export default defineEventHandler(async (event) => {
  const { scope, slug } = getQuery(event)
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const usageService = new UsageService()

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data } = await usageService.verifyUsage(
    session.user.id,
    scope as UsageKeys,
    {
      slug: slug as string,
    },
  )

  return data
})
