import type { WebClient } from "@slack/web-api";

interface BarriersCreateOptions {
  primaryUsergroupId: string;
  barrieredFromUsergroupIds: string[];
}

export async function executeBarriersCreate(
  client: WebClient,
  opts: BarriersCreateOptions,
) {
  return await client.admin.barriers.create({
    primary_usergroup_id: opts.primaryUsergroupId,
    barriered_from_usergroup_ids: opts.barrieredFromUsergroupIds,
    restricted_subjects: ["im", "mpim", "call"],
  });
}
