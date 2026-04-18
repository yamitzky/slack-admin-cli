import type { WebClient } from "@slack/web-api";

interface TeamsAccessLogsOptions {
  before?: number;
  count?: number;
  page?: number;
  teamId?: string;
}

export async function executeTeamsAccessLogs(client: WebClient, opts: TeamsAccessLogsOptions) {
  const params: Record<string, unknown> = {};
  if (opts.before !== undefined) params.before = opts.before;
  if (opts.count !== undefined) params.count = opts.count;
  if (opts.page !== undefined) params.page = opts.page;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  const response = await client.team.accessLogs(params);
  return response.logins ?? [];
}
