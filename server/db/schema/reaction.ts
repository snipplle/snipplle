import { createId } from '@paralleldrive/cuid2'
import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { user } from './user'
import { relations } from 'drizzle-orm'
import { snippet } from './snippet'
import { collection } from './collection'

export const reaction = pgTable('reactions', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  snippetId: text('snippet_id').references(() => snippet.id, { onDelete: 'cascade' }),
  collectionId: text('collection_id').references(() => collection.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueUserTarget: unique().on(table.userId, table.snippetId, table.collectionId),
}))

export const reactionRelations = relations(reaction, ({ one }) => ({
  user: one(user, {
    fields: [reaction.userId],
    references: [user.id],
  }),
  snippet: one(snippet, {
    fields: [reaction.snippetId],
    references: [snippet.id],
  }),
  collection: one(collection, {
    fields: [reaction.collectionId],
    references: [collection.id],
  }),
}))

