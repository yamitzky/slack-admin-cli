import type { WebClient } from "@slack/web-api";

interface AppsRequestsListOptions {
  teamId?: string;
  enterpriseId?: string;
  certified?: boolean;
  cursor?: string;
  limit?: number;
}

export async function executeAppsRequestsList(
  client: WebClient,
  opts: AppsRequestsListOptions,
) {
  const params: Record<string, unknown> = {};
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  if (opts.certified !== undefined) params.certified = opts.certified;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.apps.requests.list(params);
  return response.app_requests ?? [];
}
