import { pgTable, text, timestamp, json, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { collection } from './collection'

export const collectionVersion = pgTable('collection_versions', {
  id: text('id').primaryKey().$defaultFn(createId),
  collectionId: text('collection_id').notNull().references(() => collection.id, { onDelete: 'cascade' }),
  version: text('version').notNull(),
  files: json('files').notNull(),
  path: text('path').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    uniqueCollectionVersion: unique().on(table.collectionId, table.version),
  }
})

export const collectionVersionRelations = relations(collectionVersion, ({ one }) => ({
  collection: one(collection, {
    fields: [collectionVersion.collectionId],
    references: [collection.id],
  }),
}))