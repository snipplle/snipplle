import {
  pgTable,
  text,
  timestamp,
  json,
  unique,
  boolean,
  integer,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { collection } from './collection'
import { collectionSnippet } from './collectionSnippet'

export const collectionVersion = pgTable(
  'collection_versions',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    collectionId: text('collection_id')
      .notNull()
      .references(() => collection.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    isLatest: boolean('is_latest').default(false).notNull(),
    files: json('files'),
    path: text('path').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      uniqueCollectionVersion: unique().on(table.collectionId, table.version),
    }
  },
)

export const collectionVersionRelations = relations(
  collectionVersion,
  ({ one, many }) => ({
    collection: one(collection, {
      fields: [collectionVersion.collectionId],
      references: [collection.id],
    }),
    snippetVersions: many(collectionSnippet),
  }),
)
