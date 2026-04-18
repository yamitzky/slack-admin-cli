import type { WebClient } from "@slack/web-api";

interface UsergroupsUsersUpdateOptions {
  usergroup: string;
  users: string;
  includeCount?: boolean;
  teamId?: string;
}

export async function executeUsergroupsUsersUpdate(client: WebClient, opts: UsergroupsUsersUpdateOptions) {
  const params: { usergroup: string; users: string; include_count?: boolean; team_id?: string } = {
    usergroup: opts.usergroup,
    users: opts.users,
  };
  if (opts.includeCount !== undefined) params.include_count = opts.includeCount;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  await client.usergroups.users.update(params);
}
