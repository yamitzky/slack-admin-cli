import type { WebClient } from "@slack/web-api";

interface AppsRequestsCancelOptions {
  requestId: string;
  teamId?: string;
  enterpriseId?: string;
}

export async function executeAppsRequestsCancel(
  client: WebClient,
  opts: AppsRequestsCancelOptions,
): Promise<void> {
  const params: Record<string, unknown> = { request_id: opts.requestId };
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  await client.apiCall("admin.apps.requests.cancel", params);
}
