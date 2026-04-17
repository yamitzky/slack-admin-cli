import type { WebClient } from "@slack/web-api";

interface RolesListAssignmentsOptions {
  entityIds?: string[];
  roleIds?: string[];
  cursor?: string;
  limit?: number;
  sortDir?: "asc" | "desc";
}

export interface RoleAssignment {
  role_id?: string;
  entity_id?: string;
  user_id?: string;
}

export async function executeRolesListAssignments(
  client: WebClient,
  opts: RolesListAssignmentsOptions,
): Promise<RoleAssignment[]> {
  const params: Record<string, unknown> = {};
  if (opts.entityIds !== undefined) params.entity_ids = opts.entityIds;
  if (opts.roleIds !== undefined) params.role_ids = opts.roleIds;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  if (opts.sortDir !== undefined) params.sort_dir = opts.sortDir;
  const response = await client.apiCall("admin.roles.listAssignments", params);
  const assignments = (response as { role_assignments?: RoleAssignment[] }).role_assignments;
  return assignments ?? [];
}
