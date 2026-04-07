import type { WebClient } from "@slack/web-api";

interface AppsConfigSetOptions {
  appId: string;
  domainRestrictions?: { urls?: string[]; emails?: string[] };
  workflowAuthStrategy?: string;
}

export async function executeAppsConfigSet(
  client: WebClient,
  opts: AppsConfigSetOptions,
): Promise<void> {
  const params: Record<string, unknown> = { app_id: opts.appId };
  if (opts.domainRestrictions !== undefined) params.domain_restrictions = opts.domainRestrictions;
  if (opts.workflowAuthStrategy !== undefined) params.workflow_auth_strategy = opts.workflowAuthStrategy;
  await client.apiCall("admin.apps.config.set", params);
}
