import type { WebClient } from "@slack/web-api";

export async function executeSetDescription(
  client: WebClient,
  opts: { teamId: string; description: string },
) {
  return await client.admin.teams.settings.setDescription({
    team_id: opts.teamId,
    description: opts.description,
  });
}
