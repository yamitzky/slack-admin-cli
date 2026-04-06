import type { WebClient } from "@slack/web-api";

export async function executeSetName(
  client: WebClient,
  opts: { teamId: string; name: string },
) {
  return await client.admin.teams.settings.setName({
    team_id: opts.teamId,
    name: opts.name,
  });
}
