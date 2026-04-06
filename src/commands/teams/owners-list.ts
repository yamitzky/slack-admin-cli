import type { WebClient } from "@slack/web-api";

interface TeamsOwnersListOptions {
  teamId: string;
  cursor?: string;
  limit?: number;
}

export async function executeTeamsOwnersList(
  client: WebClient,
  opts: TeamsOwnersListOptions,
) {
  const response = await client.admin.teams.owners.list({
    team_id: opts.teamId,
    cursor: opts.cursor,
    limit: opts.limit,
  });
  return response.owner_ids ?? [];
}
