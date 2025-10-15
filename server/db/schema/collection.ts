import {
  pgTable,
  text,
  timestamp,
  boolean,
  unique,
  integer,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { workspace } from './workspace'
import { user } from './user'
import { collectionTag } from './collectionTag'
import { reaction } from './reaction'

export const collection = pgTable(
  'collections',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspace.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    language: text('language').notNull(),
    isPublic: boolean('is_public').default(true).notNull(),
    path: text('path'),
    downloads: integer('downloads').default(0).notNull(),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueWorkspaceCollection: unique().on(table.workspaceId, table.name),
  }),
)

export const collectionRelations = relations(collection, ({ one, many }) => ({
  workspace: one(workspace, {
    fields: [collection.workspaceId],
    references: [workspace.id],
  }),
  creator: one(user, {
    fields: [collection.createdBy],
    references: [user.id],
  }),
  collectionTags: many(collectionTag),
  reactions: many(reaction),
}))
