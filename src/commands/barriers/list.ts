import type { WebClient } from "@slack/web-api";

interface BarriersListOptions {
  cursor?: string;
  limit?: number;
}

export async function executeBarriersList(
  client: WebClient,
  opts: BarriersListOptions,
) {
  const response = await client.admin.barriers.list({
    cursor: opts.cursor,
    limit: opts.limit,
  });
  return response.barriers ?? [];
}
