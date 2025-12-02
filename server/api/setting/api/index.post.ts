import { apikey } from '~~/server/db/schema'

import { createApiKeySchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { workspaceId, name } = await readValidatedBody(
    event,
    createApiKeySchema.parse,
  )
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const db = useDrizzle()

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const apiKey = await auth.api.createApiKey({
    body: {
      name,
      expiresIn: 60 * 60 * 24 * 30,
      userId: session.user.id,
      prefix: 'sk-',
    },
  })

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create API key',
    })
  }

  await db
    .update(apikey)
    .set({
      workspaceId,
    })
    .where(eq(apikey.id, apiKey.id))

  return apiKey.key
})
