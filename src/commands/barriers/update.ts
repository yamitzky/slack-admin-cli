import type { WebClient } from "@slack/web-api";

interface BarriersUpdateOptions {
  barrierId: string;
  primaryUsergroupId: string;
  barrieredFromUsergroupIds: string[];
}

export async function executeBarriersUpdate(
  client: WebClient,
  opts: BarriersUpdateOptions,
) {
  return await client.admin.barriers.update({
    barrier_id: opts.barrierId,
    primary_usergroup_id: opts.primaryUsergroupId,
    barriered_from_usergroup_ids: opts.barrieredFromUsergroupIds,
    restricted_subjects: ["im", "mpim", "call"],
  });
}
