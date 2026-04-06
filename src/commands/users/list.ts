import type { WebClient } from "@slack/web-api";

interface UsersListOptions {
  teamId?: string;
  isActive?: boolean;
  cursor?: string;
  limit?: number;
}

export async function executeUsersList(client: WebClient, opts: UsersListOptions) {
  const params: Record<string, unknown> = {};
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.isActive !== undefined) params.is_active = opts.isActive;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.users.list(params);
  return response.users ?? [];
}
