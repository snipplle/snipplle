import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import { collection } from './collection'
import { relations } from 'drizzle-orm'

export const collectionTag = pgTable(
  'collection_snippets',
  {
    collectionId: text('collection_id')
      .notNull()
      .references(() => collection.id, { onDelete: 'cascade' }),
    snippetId: text('snippet_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.collectionId] })],
)

export const collectionTagRelations = relations(collectionTag, ({ one }) => ({
  collection: one(collection, {
    fields: [collectionTag.collectionId],
    references: [collection.id],
  }),
}))
