import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import { SnippetService } from '~~/server/services/snippet.service'
import { TagService } from '~~/server/services/tag.service'
import { UsageService } from '~~/server/services/usage.service'

import type { Database } from '~~/server/types/database.types'
import { createSnippetSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { name, language, description, tags, isPublic, workspaceId } =
    await readValidatedBody(event, createSnippetSchema.parse)
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient<Database>(event)
  const tagService = new TagService(supabase)
  const snippetService = new SnippetService(supabase)
  const usageService = new UsageService(supabase)

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data: isExceeded, error: verifyError } =
    await usageService.verifyUsage(user?.id, 'snippets')

  if (verifyError || isExceeded) {
    throw createError({
      statusCode: 403,
      statusMessage: verifyError?.message || 'Usage limit exceeded',
    })
  }

  const tagIds: string[] = []

  for (const tag of tags || []) {
    const { data: existTag } = await tagService.getTag(tag.name, 'id')

    if (existTag) {
      tagIds.push(existTag.id as string)

      continue
    }

    const { data, error } = await tagService.createTag(tag)

    if (!data || error) {
      throw createError({
        statusCode: 500,
        statusMessage: error?.message,
      })
    }

    tagIds.push(data.id)
  }

  const { data, error } = await snippetService.createSnippet(
    {
      name,
      language,
      description,
      isPublic,
    },
    user.id,
    workspaceId,
  )

  if (!data || error) {
    throw createError({
      statusCode: 500,
      statusMessage: error?.message,
    })
  }

  for (const tagId of tagIds) {
    await snippetService.createSnippetTag(data.id, tagId)
  }

  await usageService.incrementUsage(user?.id, 'snippets')

  return data
})
