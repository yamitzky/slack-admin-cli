import type { WebClient } from "@slack/web-api";

interface AppsRestrictedListOptions {
  teamId?: string;
  enterpriseId?: string;
  certified?: boolean;
  cursor?: string;
  limit?: number;
}

export async function executeAppsRestrictedList(
  client: WebClient,
  opts: AppsRestrictedListOptions,
) {
  const base = {
    ...(opts.certified !== undefined ? { certified: opts.certified } : {}),
    ...(opts.cursor !== undefined ? { cursor: opts.cursor } : {}),
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
  };

  if (opts.teamId !== undefined) {
    const response = await client.admin.apps.restricted.list({ ...base, team_id: opts.teamId });
    return response.restricted_apps ?? [];
  }
  if (opts.enterpriseId !== undefined) {
    const response = await client.admin.apps.restricted.list({ ...base, enterprise_id: opts.enterpriseId });
    return response.restricted_apps ?? [];
  }
  throw new Error("Either --team-id or --enterprise-id must be provided.");
}
