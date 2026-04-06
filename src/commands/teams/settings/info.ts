import type { WebClient } from "@slack/web-api";

export async function executeSettingsInfo(
  client: WebClient,
  opts: { teamId: string },
) {
  const response = await client.admin.teams.settings.info({
    team_id: opts.teamId,
  });
  return response.team;
}
