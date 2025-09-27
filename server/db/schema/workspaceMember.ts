import { pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { user } from './user'
import { workspace } from './workspace'

export const ROLE = pgEnum('role', ['owner', 'admin', 'member'])

export const workspaceMember = pgTable('workspace_members', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  workspaceId: text('workspace_id').notNull().references(() => workspace.id, { onDelete: 'cascade' }),
  role: ROLE('role').default('member').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    uniqueUserWorkspace: unique().on(table.userId, table.workspaceId),
  }
})

export const workspaceMemberRelations = relations(workspaceMember, ({ one }) => ({
  user: one(user, {
    fields: [workspaceMember.userId],
    references: [user.id],
  }),
  workspace: one(workspace, {
    fields: [workspaceMember.workspaceId],
    references: [workspace.id],
  }),
}))