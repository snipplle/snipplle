import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import { collection } from './collection'
import { relations } from 'drizzle-orm'

export const collectionSnippet = pgTable(
  'collection_snippets',
  {
    collectionId: text('collection_id')
      .notNull()
      .references(() => collection.id, { onDelete: 'cascade' }),
    snippetId: text('snippet_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.collectionId, table.snippetId] })],
)

export const collectionSnippetRelations = relations(
  collectionSnippet,
  ({ one }) => ({
    collection: one(collection, {
      fields: [collectionSnippet.collectionId],
      references: [collection.id],
    }),
  }),
)
