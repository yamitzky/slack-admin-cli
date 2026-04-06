import type { WebClient } from "@slack/web-api";

interface TeamsListOptions {
  cursor?: string;
  limit?: number;
}

export async function executeTeamsList(
  client: WebClient,
  opts: TeamsListOptions,
) {
  const response = await client.admin.teams.list({
    cursor: opts.cursor,
    limit: opts.limit,
  });
  return response.teams ?? [];
}
