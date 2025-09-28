import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import { snippetTag } from './snippetTag'

export const tag = pgTable('tags', {
  id: text('id').primaryKey().$defaultFn(createId),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tagRelations = relations(tag, ({ many }) => ({
  snippetTags: many(snippetTag),
}))
