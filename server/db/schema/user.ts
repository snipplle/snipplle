import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { workspaceMember } from './workspaceMember'
import { snippet } from './snippet'
import { collection } from './collection'
import { apiToken } from './apiToken'

export const user = pgTable('users', {
  id: text('id').primaryKey().notNull(),
  name: text('name'),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userRelations = relations(user, ({ many }) => ({
  workspaceMembers: many(workspaceMember),
  snippets: many(snippet),
  collections: many(collection),
  apiTokens: many(apiToken),
}))
