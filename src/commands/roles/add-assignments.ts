import type { WebClient } from "@slack/web-api";

interface RolesAddAssignmentsOptions {
  roleId: string;
  entityIds: [string, ...string[]];
  userIds: [string, ...string[]];
}

export async function executeRolesAddAssignments(
  client: WebClient,
  opts: RolesAddAssignmentsOptions,
): Promise<void> {
  await client.admin.roles.addAssignments({
    role_id: opts.roleId,
    entity_ids: opts.entityIds,
    user_ids: opts.userIds,
  });
}
