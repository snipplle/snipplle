import type { UsageKeys } from '../types/api.types'
import { usage } from '../db/schema'
import type { InferSelectModel } from 'drizzle-orm'

export class UsageService {
  private config = useRuntimeConfig()
  private isSelfHostedInstance: boolean
  private db = useDrizzle()

  constructor() {
    this.isSelfHostedInstance =
      this.config.SELF_HOSTED === 'true' ? true : false
  }

  async verifyUsage(
    userId: string,
    usageKey: UsageKeys,
    meta?: Record<string, string>,
  ): Promise<{ data: { isExceeded: boolean }; error: Error | null }> {
    if (this.isSelfHostedInstance) {
      return {
        data: { isExceeded: false },
        error: null,
      }
    }

    const response = await fetch(
      `${this.config.EXTERNAL_FUNCTIONS_URL}/usage`,
      {
        method: 'POST',
        body: JSON.stringify({
          userId,
          usageKey,
          meta,
        }),
      },
    )

    const data = await response.json()

    return {
      data: data as { isExceeded: boolean },
      error: null,
    }
  }

  async incrementUsage(
    userId: string,
    usageKey: Exclude<UsageKeys, UsageKeys.snippetVersions>,
  ): Promise<InferSelectModel<typeof usage> | null> {
    if (this.isSelfHostedInstance) {
      return null
    }

    const usageData = await this.db.query.usage.findFirst({
      where: (usages, { eq }) => eq(usages.userId, userId),
      columns: {
        id: true,
        publicSnippets: true,
        privateSnippets: true,
        publicCollections: true,
        privateCollections: true,
        teamMembers: true,
        aiRequests: true,
        aiTokens: true,
      },
    })

    if (!usageData) {
      return null
    }

    const payload = {
      [usageKey]: Number(usageData[usageKey]) + 1,
    }

    const updatedUsage = await this.db
      .update(usage)
      .set({
        ...payload,
        userId,
      })
      .where(eq(usage.id, usageData.id))
      .returning()

    return updatedUsage[0]
  }

  async decrementUsage(
    userId: string,
    usageKey: Exclude<UsageKeys, UsageKeys.snippetVersions>,
  ): Promise<InferSelectModel<typeof usage> | null> {
    if (this.isSelfHostedInstance) {
      return null
    }

    const usageData = await this.db.query.usage.findFirst({
      where: (usages, { eq }) => eq(usages.userId, userId),
      columns: {
        id: true,
        publicSnippets: true,
        privateSnippets: true,
        publicCollections: true,
        privateCollections: true,
        teamMembers: true,
        aiRequests: true,
        aiTokens: true,
      },
    })

    if (!usageData) {
      return null
    }

    const payload = {
      [usageKey]: Number(usageData[usageKey]) - 1,
    }

    const updatedUsage = await this.db
      .update(usage)
      .set({
        ...payload,
        userId,
      })
      .where(eq(usage.id, usageData.id))
      .returning()

    return updatedUsage[0]
  }
}
