import type { WebClient } from "@slack/web-api";

interface RolesRemoveAssignmentsOptions {
  roleId: string;
  entityIds: [string, ...string[]];
  userIds: [string, ...string[]];
}

export async function executeRolesRemoveAssignments(
  client: WebClient,
  opts: RolesRemoveAssignmentsOptions,
): Promise<void> {
  await client.admin.roles.removeAssignments({
    role_id: opts.roleId,
    entity_ids: opts.entityIds,
    user_ids: opts.userIds,
  });
}
