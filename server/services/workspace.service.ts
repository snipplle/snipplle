import slugify from 'slugify'
import type { InferSelectModel } from 'drizzle-orm'

import { workspaceMember, workspace } from '../db/schema'

export class WorkspaceService {
  private db = useDrizzle()

  async getWorkspaces(): Promise<InferSelectModel<typeof workspace>[]> {
    return await this.db.query.workspace.findMany()
  }

  async getUserWorkspaces(
    userId: string,
    select: any = {
      workspaceId: true,
    },
  ): Promise<
    Partial<
      InferSelectModel<typeof workspaceMember> & {
        workspace: InferSelectModel<typeof workspace>
      }
    >[]
  > {
    return await this.db.query.workspaceMember.findMany({
      where: (workspaceMember, { eq }) => eq(workspaceMember.userId, userId),
      columns: Object.keys(select).length ? select : undefined,
      with: {
        workspace: true,
      },
    })
  }

  async createWorkspace(
    name: string,
  ): Promise<InferSelectModel<typeof workspace>> {
    const workspaceData = await this.db
      .insert(workspace)
      .values({
        name,
        slug: slugify(name, {
          lower: true,
          remove: /[*+~.()'"!:@]/g,
        }),
      })
      .returning()

    return workspaceData[0]
  }

  async addMember(
    workspaceId: string,
    userId: string,
    role: InferSelectModel<typeof workspaceMember>['role'],
  ): Promise<InferSelectModel<typeof workspaceMember>> {
    const memberData = await this.db
      .insert(workspaceMember)
      .values({
        workspaceId,
        userId,
        role,
      })
      .returning()

    return memberData[0]
  }

  async getDefaultWorkspace(
    userId: string,
  ): Promise<InferSelectModel<typeof workspace> | null | undefined> {
    const memberData = await this.db.query.workspaceMember.findFirst({
      where: (workspaceMember, { eq, and }) =>
        and(
          eq(workspaceMember.userId, userId),
          eq(workspaceMember.role, 'owner'),
        ),
      columns: {
        workspaceId: true,
      },
      with: {
        workspace: true,
      },
    })

    if (!memberData) {
      return null
    }

    return await this.db.query.workspace.findFirst({
      where: (workspace, { eq }) => eq(workspace.id, memberData.workspaceId),
    })
  }

  async getWorkspaceBySlug(
    slug: string,
  ): Promise<InferSelectModel<typeof workspace> | null | undefined> {
    return await this.db.query.workspace.findFirst({
      where: (workspace, { eq }) => eq(workspace.slug, slug),
    })
  }

  async getOwner(
    workspaceId: string,
  ): Promise<
    Pick<InferSelectModel<typeof workspaceMember>, 'userId'> | null | undefined
  > {
    return await this.db.query.workspaceMember.findFirst({
      where: (workspaceMember, { eq, and }) =>
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.role, 'owner'),
        ),
      columns: {
        userId: true,
      },
    })
  }

  async getMembers(
    workspaceId: string,
  ): Promise<InferSelectModel<typeof workspaceMember>[] | null> {
    const memberData = await this.db.query.workspaceMember.findMany({
      where: (workspaceMember, { eq }) =>
        eq(workspaceMember.workspaceId, workspaceId),
    })

    if (!memberData) {
      return null
    }

    const userData = await this.db.query.user.findMany({
      where: (user, { inArray }) =>
        inArray(
          user.id,
          memberData.map((item) => item.userId),
        ),
      columns: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!userData) {
      return null
    }

    return memberData.map((item) => ({
      ...item,
      user: userData.find((userItem) => userItem.id === item.userId),
    }))
  }

  async removeMember(
    workspaceId: string,
    userId: string,
  ): Promise<InferSelectModel<typeof workspaceMember>> {
    const memberData = await this.db
      .delete(workspaceMember)
      .where(
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId),
        ),
      )
      .returning()

    return memberData[0]
  }

  async checkMember(
    workspaceId: string,
    userId: string,
  ): Promise<{
    hasAccess: boolean
  }> {
    const memberData = await this.db.query.workspaceMember.findFirst({
      where: (workspaceMember, { eq, and }) =>
        and(
          eq(workspaceMember.workspaceId, workspaceId),
          eq(workspaceMember.userId, userId),
        ),
    })

    if (!memberData) {
      return {
        hasAccess: false,
      }
    }

    return {
      hasAccess: true,
    }
  }
}
