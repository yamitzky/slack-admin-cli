import type { WebClient } from "@slack/web-api";

interface UsergroupsDisableOptions {
  usergroup: string;
  includeCount?: boolean;
  teamId?: string;
}

export async function executeUsergroupsDisable(client: WebClient, opts: UsergroupsDisableOptions) {
  const params: { usergroup: string; include_count?: boolean; team_id?: string } = { usergroup: opts.usergroup };
  if (opts.includeCount !== undefined) params.include_count = opts.includeCount;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  await client.usergroups.disable(params);
}
