import { CollectionService } from '~~/server/services/collection.service'

import { uploadCollectionSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { slug, workspaceId, snippets, collectionCode, removedCode } =
    await readValidatedBody(event, uploadCollectionSchema.parse)
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const collectionService = new CollectionService()

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  if (!workspaceId || !collectionCode || !snippets) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  if (!collectionCode.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Collection code is empty',
    })
  }

  const collection = await collectionService.uploadCollection({
    workspaceId,
    id,
    slug,
    collectionCode,
    removedCode,
    snippets,
  })

  if (!collection) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to upload collection',
    })
  }

  return collection
})
