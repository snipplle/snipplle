import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { user } from './user'
import { workspace } from './workspace'
import { snippetVersion } from './snippetVersion'
import { snippetTag } from './snippetTag'
import { reaction } from './reaction'

export const snippet = pgTable(
  'snippets',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspace.id, { onDelete: 'cascade' }),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    language: text('language'),
    preview: text('preview'),
    path: text('path'),
    downloads: integer('downloads').default(0).notNull(),
    isPublic: boolean('is_public').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueWorkspaceSnippet: unique().on(table.workspaceId, table.name),
  }),
)

export const snippetRelations = relations(snippet, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [snippet.workspaceId],
    references: [workspace.id],
  }),
  creator: one(user, {
    fields: [snippet.createdBy],
    references: [user.id],
  }),
  versions: many(snippetVersion),
  snippetTags: many(snippetTag),
  reactions: many(reaction),
}))
