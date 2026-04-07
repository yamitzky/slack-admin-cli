import type { WebClient } from "@slack/web-api";

interface AppsApproveOptions {
  appId?: string;
  requestId?: string;
  teamId?: string;
  enterpriseId?: string;
}

export async function executeAppsApprove(
  client: WebClient,
  opts: AppsApproveOptions,
): Promise<void> {
  const params: Record<string, unknown> = {};
  if (opts.appId !== undefined) params.app_id = opts.appId;
  if (opts.requestId !== undefined) params.request_id = opts.requestId;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  await client.admin.apps.approve(params);
}
