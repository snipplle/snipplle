import { pgTable, text, timestamp, json, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { workspace } from './workspace'

export const subscription = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(createId),
  workspaceId: text('workspace_id').notNull().unique().references(() => workspace.id),
  plan: text('plan').notNull(),
  status: text('status').notNull(),
  customerId: text('customer_id'),
  subscriptionId: text('subscription_id'),
  metadata: json('metadata'),
  isActive: boolean('is_active').default(false).notNull(),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  workspace: one(workspace, {
    fields: [subscription.workspaceId],
    references: [workspace.id],
  }),
}))