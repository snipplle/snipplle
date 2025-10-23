import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { workspaceMember } from './workspaceMember'
import { snippet } from './snippet'
import { collection } from './collection'
import { apiToken } from './apiToken'
import { subscription } from './subscription'

export const user = pgTable('users', {
  id: text('id').primaryKey().notNull(),
  name: text('name'),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userRelations = relations(user, ({ many, one }) => ({
  workspaceMembers: many(workspaceMember),
  snippets: many(snippet),
  collections: many(collection),
  apiTokens: many(apiToken),
  subscription: one(subscription, {
    fields: [user.id],
    references: [subscription.userId],
  }),
}))
