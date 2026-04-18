import type { WebClient } from "@slack/web-api";

interface TeamsIntegrationLogsOptions {
  appId?: string;
  changeType?: string;
  count?: number;
  page?: number;
  serviceId?: string;
  teamId?: string;
  user?: string;
}

export async function executeTeamsIntegrationLogs(client: WebClient, opts: TeamsIntegrationLogsOptions) {
  const params: Record<string, unknown> = {};
  if (opts.appId !== undefined) params.app_id = opts.appId;
  if (opts.changeType !== undefined) params.change_type = opts.changeType;
  if (opts.count !== undefined) params.count = opts.count;
  if (opts.page !== undefined) params.page = opts.page;
  if (opts.serviceId !== undefined) params.service_id = opts.serviceId;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.user !== undefined) params.user = opts.user;
  const response = await client.team.integrationLogs(params);
  return response.logs ?? [];
}
