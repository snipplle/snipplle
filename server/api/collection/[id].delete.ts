import { CollectionService } from '~~/server/services/collection.service'
import { UsageService } from '~~/server/services/usage.service'
import { UsageKeys } from '~~/server/types/api.types'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const collectionService = new CollectionService()
  const usageService = new UsageService()

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const collection = await collectionService.deleteCollection(
    id,
    session.user.id,
  )

  if (!collection) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete collection',
    })
  }

  await usageService.decrementUsage(
    session.user.id,
    collection.isPublic
      ? UsageKeys.publicCollections
      : UsageKeys.privateCollections,
  )

  return {
    success: true,
  }
})
