import {
  boolean,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { snippet } from './snippet'
import { collectionSnippet } from './collectionSnippet'

export const snippetVersion = pgTable(
  'snippet_versions',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    snippetId: text('snippet_id')
      .notNull()
      .references(() => snippet.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    isLatest: boolean('is_latest').default(false).notNull(),
    path: text('path').notNull(),
    files: json('files'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      uniqueSnippetVersion: unique().on(table.snippetId, table.version),
    }
  },
)

export const snippetVersionRelations = relations(
  snippetVersion,
  ({ one, many }) => ({
    snippet: one(snippet, {
      fields: [snippetVersion.snippetId],
      references: [snippet.id],
    }),
    collectionVersions: many(collectionSnippet),
  }),
)
