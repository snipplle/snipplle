import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { collection } from './collection'
import { snippetFork } from './snippetFork'

export const collectionSnippet = pgTable(
  'collection_snippets',
  {
    collectionId: text('collection_id')
      .notNull()
      .references(() => collection.id),
    snippetForkId: text('snippet_fork_id')
      .notNull()
      .references(() => snippetFork.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.collectionId, table.snippetForkId],
      }),
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
    snippetFork: one(snippetFork, {
      fields: [collectionSnippet.snippetForkId],
      references: [snippetFork.id],
    }),
  }),
)
