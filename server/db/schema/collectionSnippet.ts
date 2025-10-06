import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import { collection } from './collection'
import { snippet } from './snippet'
import { relations } from 'drizzle-orm'

export const collectionSnippet = pgTable(
  'collection_snippets',
  {
    collectionId: text('collection_id')
      .notNull()
      .references(() => collection.id, { onDelete: 'cascade' }),
    snippetId: text('snippet_id')
      .notNull()
      .references(() => snippet.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.collectionId, table.snippetId] }),
    }
  },
)

export const collectionSnippetRelations = relations(
  collectionSnippet,
  ({ one }) => ({
    collection: one(collection, {
      fields: [collectionSnippet.collectionId],
      references: [collection.id],
    }),
    snippet: one(snippet, {
      fields: [collectionSnippet.snippetId],
      references: [snippet.id],
    }),
  }),
)
