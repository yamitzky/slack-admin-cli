import type { WebClient } from "@slack/web-api";

interface UsergroupsAddTeamsOptions {
  usergroupId: string;
  teamIds: string[];
  autoProvision?: boolean;
}

export async function executeUsergroupsAddTeams(
  client: WebClient,
  opts: UsergroupsAddTeamsOptions,
): Promise<void> {
  await client.admin.usergroups.addTeams({
    usergroup_id: opts.usergroupId,
    team_ids: opts.teamIds,
    auto_provision: opts.autoProvision,
  });
}
