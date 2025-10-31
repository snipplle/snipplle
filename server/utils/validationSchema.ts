import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
})

export const addMemberSchema = z.object({
  workspaceId: z
    .string('Workspace ID is required')
    .min(1, 'Workspace ID should be at least 1 character long'),
  email: z.email('Invalid email address'),
})

export const removeMemberSchema = z.object({
  workspaceId: z.string('Workspace ID is required'),
  userId: z.string('User ID is required'),
})

export const createSnippetSchema = z.object({
  name: z
    .string('Snippet name is required')
    .min(1, 'Snippet name should be at least 1 character long'),
  language: z.string('Snippet language is required'),
  description: z.string().optional(),
  tags: z
    .array(
      z.object({
        name: z.string(),
        color: z.string(),
      }),
    )
    .optional(),
  isPublic: z.boolean('Snippet visibility is required'),
  workspaceId: z.string('Workspace ID is required'),
})

export const updateSnippetSchema = z.object({
  name: z
    .string('Snippet name is required')
    .min(1, 'Snippet name should be at least 1 character long'),
  description: z.string().optional(),
  isPublic: z.boolean('Snippet visibility is required'),
  workspaceId: z.string('Workspace ID is required'),
})

export const uploadSnippetSchema = z.object({
  slug: z.string('Snippet slug is required'),
  workspaceId: z.string('Workspace ID is required'),
  snippetCode: z.string('Snippet code is required'),
  language: z.string('Snippet language is required'),
})

export const createCollectionSchema = z.object({
  name: z.string('Collection name is required'),
  description: z.string().optional(),
  language: z.string('Collection language is required'),
  tags: z
    .array(
      z.object({
        name: z.string(),
        color: z.string(),
      }),
    )
    .optional(),
  isPublic: z.boolean('Collection visibility is required'),
  workspaceId: z.string('Workspace ID is required'),
})

export const updateCollectionSchema = z.object({
  slug: z.string('Collection slug is required'),
  snippets: z.array(
    z.object({
      id: z.string('Snippet ID is required'),
    }),
  ),
  collectionCode: z.string('Collection code is required'),
  workspaceId: z.string('Workspace ID is required'),
})

export const createApiKeySchema = z.object({
  name: z.string('API key name is required'),
  workspaceId: z.string('Workspace ID is required'),
})
