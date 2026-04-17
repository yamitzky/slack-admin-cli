import type { WebClient } from "@slack/web-api";

interface BarriersDeleteOptions {
  barrierId: string;
}

export async function executeBarriersDelete(
  client: WebClient,
  opts: BarriersDeleteOptions,
): Promise<void> {
  await client.admin.barriers.delete({ barrier_id: opts.barrierId });
}
