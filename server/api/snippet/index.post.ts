import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { createId } from '@paralleldrive/cuid2'
import slugify from 'slugify'

import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
  const { name, description, tags, isPublic, workspaceId } =
    await readBody(event)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const tagIds = []

  for (const tag of tags) {
    const { data: existTag } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tag.name)
      .single()

    if (existTag) {
      continue
    }

    const { data, error } = await supabase
      .from('tags')
      .insert({
        id: createId(),
        name: tag.name,
        color: tag.color,
      })
      .select('id')
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        message: error.message,
      })
    }

    tagIds.push(data.id)
  }

  const { data, error } = await supabase
    .from('snippets')
    .insert({
      id: createId(),
      name,
      slug: slugify(name, {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
      }),
      description,
      is_public: isPublic,
      created_by: user?.id,
      workspace_id: workspaceId,
    })
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }

  for (const tagId of tagIds) {
    await supabase.from('snippet_tags').insert({
      snippet_id: data.id,
      tag_id: tagId,
    })
  }

  return data
})
