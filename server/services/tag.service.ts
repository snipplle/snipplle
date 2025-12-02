import type { InferSelectModel } from 'drizzle-orm'
import { tag } from '../db/schema'

export class TagService {
  private db = useDrizzle()

  async getTags(): Promise<InferSelectModel<typeof tag>[]> {
    return await this.db.query.tag.findMany()
  }

  async getTag(
    name: string,
    select = {},
  ): Promise<InferSelectModel<typeof tag> | undefined> {
    return await this.db.query.tag.findFirst({
      where: (tag, { eq }) => eq(tag.name, name),
      columns: Object.keys(select).length ? select : undefined,
    })
  }

  async createTag(
    payload: Pick<InferSelectModel<typeof tag>, 'name' | 'color'>,
  ): Promise<InferSelectModel<typeof tag>> {
    const tagData = await this.db.insert(tag).values(payload).returning()

    return tagData[0]
  }
}
