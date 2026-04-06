import type { WebClient } from "@slack/web-api";

interface TeamsAdminsListOptions {
  teamId: string;
  cursor?: string;
  limit?: number;
}

export async function executeTeamsAdminsList(
  client: WebClient,
  opts: TeamsAdminsListOptions,
) {
  const response = await client.admin.teams.admins.list({
    team_id: opts.teamId,
    cursor: opts.cursor,
    limit: opts.limit,
  });
  return response.admin_ids ?? [];
}
