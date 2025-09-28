import { json, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { snippet } from './snippet'

export const snippetVersion = pgTable(
  'snippet_versions',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    snippetId: text('snippet_id')
      .notNull()
      .references(() => snippet.id, { onDelete: 'cascade' }),
    version: text('version').notNull(),
    path: text('path').notNull(),
    files: json('files').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      uniqueSnippetVersion: unique().on(table.snippetId, table.version),
    }
  },
)

export const snippetVersionRelations = relations(snippetVersion, ({ one }) => ({
  snippet: one(snippet, {
    fields: [snippetVersion.snippetId],
    references: [snippet.id],
  }),
}))
