import type { WebClient } from "@slack/web-api";

export async function executeSetIcon(
  client: WebClient,
  opts: { teamId: string; imageUrl: string },
) {
  return await client.admin.teams.settings.setIcon({
    team_id: opts.teamId,
    image_url: opts.imageUrl,
  });
}
