import type { WebClient } from "@slack/web-api";

interface UsergroupsListOptions {
  includeCount?: boolean;
  includeDisabled?: boolean;
  includeUsers?: boolean;
  teamId?: string;
}

export async function executeUsergroupsList(client: WebClient, opts: UsergroupsListOptions) {
  const params: Record<string, unknown> = {};
  if (opts.includeCount !== undefined) params.include_count = opts.includeCount;
  if (opts.includeDisabled !== undefined) params.include_disabled = opts.includeDisabled;
  if (opts.includeUsers !== undefined) params.include_users = opts.includeUsers;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  const response = await client.usergroups.list(params);
  return response.usergroups ?? [];
}
