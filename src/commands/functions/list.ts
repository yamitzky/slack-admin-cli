import type { WebClient } from "@slack/web-api";

interface FunctionsListOptions {
  appIds: string[];
  teamId?: string;
  cursor?: string;
  limit?: number;
}

export async function executeFunctionsList(
  client: WebClient,
  opts: FunctionsListOptions,
) {
  const response = await client.admin.functions.list({
    app_ids: opts.appIds,
    ...(opts.teamId !== undefined ? { team_id: opts.teamId } : {}),
    ...(opts.cursor !== undefined ? { cursor: opts.cursor } : {}),
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
  });
  return response.functions ?? [];
}
