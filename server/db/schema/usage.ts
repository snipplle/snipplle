import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { user } from './user'

export const usage = pgTable('usages', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('user_id').references(() => user.id),
  publicSnippets: integer('public_snippets').default(0).notNull(),
  privateSnippets: integer('private_snippets').default(0).notNull(),
  publicCollections: integer('public_collections').default(0).notNull(),
  privateCollections: integer('private_collections').default(0).notNull(),
  teamMembers: integer('team_members').default(0).notNull(),
  aiRequests: integer('ai_requests').default(0).notNull(),
  aiTokens: integer('ai_tokens').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const usageRelations = relations(usage, ({ one }) => ({
  user: one(user, {
    fields: [usage.userId],
    references: [user.id],
  }),
}))
