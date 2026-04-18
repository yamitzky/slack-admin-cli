import type { WebClient } from "@slack/web-api";

interface UsergroupsUsersListOptions {
  usergroup: string;
  includeDisabled?: boolean;
  teamId?: string;
}

export async function executeUsergroupsUsersList(client: WebClient, opts: UsergroupsUsersListOptions) {
  const params: { usergroup: string; include_disabled?: boolean; team_id?: string } = { usergroup: opts.usergroup };
  if (opts.includeDisabled !== undefined) params.include_disabled = opts.includeDisabled;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  const response = await client.usergroups.users.list(params);
  return response.users ?? [];
}
