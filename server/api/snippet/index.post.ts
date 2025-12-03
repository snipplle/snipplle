import { SnippetService } from '~~/server/services/snippet.service'
import { TagService } from '~~/server/services/tag.service'
import { UsageService } from '~~/server/services/usage.service'
import { UsageKeys } from '~~/server/types/api.types'

import { createSnippetSchema } from '~~/server/utils/validationSchema'

export default defineEventHandler(async (event) => {
  const { name, language, description, tags, isPublic, workspaceId } =
    await readValidatedBody(event, createSnippetSchema.parse)
  const session = await auth.api.getSession({
    headers: event.headers,
  })
  const tagService = new TagService()
  const snippetService = new SnippetService()
  const usageService = new UsageService()

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { data: usageData, error: usageError } = await usageService.verifyUsage(
    session.user.id,
    isPublic ? UsageKeys.publicSnippets : UsageKeys.privateSnippets,
  )

  if (usageError || usageData.isExceeded) {
    throw createError({
      statusCode: 403,
      statusMessage: usageError?.message || 'Usage limit exceeded',
    })
  }

  const tagIds: string[] = []

  for (const tag of tags || []) {
    const existTag = await tagService.getTag(tag.name, {
      id: true,
    })

    if (existTag) {
      tagIds.push(existTag.id as string)

      continue
    }

    const createdTag = await tagService.createTag(tag)

    if (!createdTag) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create tag',
      })
    }

    tagIds.push(createdTag.id)
  }

  const data = await snippetService.createSnippet(
    {
      name,
      language,
      description,
      isPublic,
    },
    session.user.id,
    workspaceId,
  )

  if (!data) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create snippet',
    })
  }

  for (const tagId of tagIds) {
    await snippetService.createSnippetTag(data.id, tagId)
  }

  await usageService.incrementUsage(
    session.user.id,
    isPublic ? UsageKeys.publicSnippets : UsageKeys.privateSnippets,
  )

  return data
})
