import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { collectionVersion } from './collectionVersion'
import { snippetVersion } from './snippetVersion'

export const collectionSnippet = pgTable(
  'collection_snippets',
  {
    collectionVersionId: text('collection_version_id')
      .notNull()
      .references(() => collectionVersion.id, { onDelete: 'cascade' }),
    snippetVersionId: text('snippet_version_id')
      .notNull()
      .references(() => snippetVersion.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.collectionVersionId, table.snippetVersionId],
      }),
    }
  },
)

export const collectionSnippetRelations = relations(
  collectionSnippet,
  ({ one }) => ({
    collectionVersion: one(collectionVersion, {
      fields: [collectionSnippet.collectionVersionId],
      references: [collectionVersion.id],
    }),
    snippetVersion: one(snippetVersion, {
      fields: [collectionSnippet.snippetVersionId],
      references: [snippetVersion.id],
    }),
  }),
)
