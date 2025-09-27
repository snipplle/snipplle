import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core"
import { collection } from "./collection"
import { tag } from "./tag"
import { relations } from "drizzle-orm"

export const collectionTag = pgTable('collection_tags', {
  collectionId: text('collection_id').notNull().references(() => collection.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tag.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.collectionId, table.tagId] }),
}))

export const collectionTagRelations = relations(collectionTag, ({ one }) => ({
  collection: one(collection, {
    fields: [collectionTag.collectionId],
    references: [collection.id],
  }),
  tag: one(tag, {
    fields: [collectionTag.tagId],
    references: [tag.id],
  }),
}))
