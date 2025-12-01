import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { workspaceMember } from './workspaceMember'
import { snippet } from './snippet'
import { collection } from './collection'
import { tag } from './tag'
import { apikey } from './apiKey'

export const workspace = pgTable('workspaces', {
  id: text('id').primaryKey().$defaultFn(createId),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const workspaceRelations = relations(workspace, ({ many }) => ({
  members: many(workspaceMember),
  snippets: many(snippet),
  collections: many(collection),
  tags: many(tag),
  apiKeys: many(apikey),
}))
