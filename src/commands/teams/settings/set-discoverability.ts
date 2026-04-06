import type { WebClient } from "@slack/web-api";
import type { TeamDiscoverability } from "../create";

export async function executeSetDiscoverability(
  client: WebClient,
  opts: { teamId: string; discoverability: TeamDiscoverability },
) {
  return await client.admin.teams.settings.setDiscoverability({
    team_id: opts.teamId,
    discoverability: opts.discoverability,
  });
}
