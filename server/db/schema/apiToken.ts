import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { user } from './user'
import { workspace } from './workspace'

export const apiToken = pgTable('api_tokens', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  workspaceId: text('workspace_id').notNull().references(() => workspace.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  token: text('token').unique().notNull(),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const apiTokenRelations = relations(apiToken, ({ one }) => ({
  user: one(user, {
    fields: [apiToken.userId],
    references: [user.id],
  }),
  workspace: one(workspace, {
    fields: [apiToken.workspaceId],
    references: [workspace.id],
  }),
}))