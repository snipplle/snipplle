import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { snippet } from './snippet'
import { tag } from './tag'

export const snippetTag = pgTable(
  'snippet_tags',
  {
    snippetId: text('snippet_id')
      .notNull()
      .references(() => snippet.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tag.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.snippetId, table.tagId] }),
    }
  },
)

export const snippetTagRelations = relations(snippetTag, ({ one }) => ({
  snippet: one(snippet, {
    fields: [snippetTag.snippetId],
    references: [snippet.id],
  }),
  tag: one(tag, {
    fields: [snippetTag.tagId],
    references: [tag.id],
  }),
}))
