import type { WebClient } from "@slack/web-api";

interface UsergroupsRemoveChannelsOptions {
  usergroupId: string;
  channelIds: string[];
}

export async function executeUsergroupsRemoveChannels(
  client: WebClient,
  opts: UsergroupsRemoveChannelsOptions,
): Promise<void> {
  await client.admin.usergroups.removeChannels({
    usergroup_id: opts.usergroupId,
    channel_ids: opts.channelIds,
  });
}
