import { createId } from '@paralleldrive/cuid2'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const snippetGarbage = pgTable('snippet_garbage', {
  id: text('id').primaryKey().$defaultFn(createId),
  snippetId: text('snippet_id').notNull(),
  workspaceId: text('workspace_id').notNull(),
  path: text('path').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
