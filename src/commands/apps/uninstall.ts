import type { WebClient } from "@slack/web-api";

interface AppsUninstallOptions {
  appId: string;
  teamId?: string;
  enterpriseId?: string;
}

export async function executeAppsUninstall(
  client: WebClient,
  opts: AppsUninstallOptions,
): Promise<void> {
  const params: Record<string, unknown> = { app_id: opts.appId };
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  await client.apiCall("admin.apps.uninstall", params);
}
