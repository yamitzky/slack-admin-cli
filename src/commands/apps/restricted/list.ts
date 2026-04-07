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
  const params: Record<string, unknown> = {};
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  if (opts.certified !== undefined) params.certified = opts.certified;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.apps.restricted.list(params);
  return response.restricted_apps ?? [];
}
