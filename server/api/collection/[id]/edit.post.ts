import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { CollectionService } from '~~/server/services/collection.service'

import type { Database } from '~~/server/types/database.types'
import { updateCollectionSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { id } = await getRouterParams(event)
  const { name, description, isPublic } = await readValidatedBody(
    event,
    updateCollectionSchema.parse,
  )
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const collectionService = new CollectionService(supabase)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data, error } = await collectionService.updateCollection(id, {
    name,
    description,
    is_public: isPublic,
  })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message,
    })
  }

  return data
})
