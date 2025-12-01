import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { workspaceMember } from './workspaceMember'
import { snippet } from './snippet'
import { collection } from './collection'
import { apikey } from './apiKey'
import { subscription } from './subscription'
import { session } from './session'
import { account } from './account'

export const user = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  workspaceMembers: many(workspaceMember),
  snippets: many(snippet),
  collections: many(collection),
  apikeys: many(apikey),
  subscription: one(subscription, {
    fields: [user.id],
    references: [subscription.userId],
  }),
}))
