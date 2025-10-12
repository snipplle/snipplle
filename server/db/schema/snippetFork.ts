import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { collectionSnippet } from './collectionSnippet'
import { relations } from 'drizzle-orm'

export const snippetFork = pgTable(
  'snippet_forks',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    originalId: text('original_id').notNull(),
    workspaceId: text('workspace_id').notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    language: text('language').notNull(),
    path: text('path').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueWorkspaceSnippet: unique().on(table.workspaceId, table.name),
  }),
)

export const snippetForkRelations = relations(snippetFork, ({ many }) => ({
  collections: many(collectionSnippet),
}))
