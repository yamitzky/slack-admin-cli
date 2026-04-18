import type { WebClient } from "@slack/web-api";

interface UsergroupsEnableOptions {
  usergroup: string;
  includeCount?: boolean;
  teamId?: string;
}

export async function executeUsergroupsEnable(client: WebClient, opts: UsergroupsEnableOptions) {
  const params: { usergroup: string; include_count?: boolean; team_id?: string } = { usergroup: opts.usergroup };
  if (opts.includeCount !== undefined) params.include_count = opts.includeCount;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  await client.usergroups.enable(params);
}
