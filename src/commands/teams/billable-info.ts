import type { WebClient } from "@slack/web-api";

interface TeamsBillableInfoOptions {
  user?: string;
  teamId?: string;
  cursor?: string;
  limit?: number;
}

export async function executeTeamsBillableInfo(client: WebClient, opts: TeamsBillableInfoOptions) {
  const params: Record<string, unknown> = {};
  if (opts.user !== undefined) params.user = opts.user;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  const response = await client.team.billableInfo(params);
  return response.billable_info ?? {};
}
