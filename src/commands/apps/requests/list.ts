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
  const base = {
    ...(opts.certified !== undefined ? { certified: opts.certified } : {}),
    ...(opts.cursor !== undefined ? { cursor: opts.cursor } : {}),
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
  };

  if (opts.teamId !== undefined) {
    const response = await client.admin.apps.requests.list({ ...base, team_id: opts.teamId });
    return response.app_requests ?? [];
  }
  if (opts.enterpriseId !== undefined) {
    const response = await client.admin.apps.requests.list({ ...base, enterprise_id: opts.enterpriseId });
    return response.app_requests ?? [];
  }
  throw new Error("Either --team-id or --enterprise-id must be provided.");
}
