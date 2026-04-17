import type { WebClient } from "@slack/web-api";

interface UsergroupsAddChannelsOptions {
  usergroupId: string;
  channelIds: string[];
  teamId?: string;
}

export async function executeUsergroupsAddChannels(
  client: WebClient,
  opts: UsergroupsAddChannelsOptions,
): Promise<void> {
  await client.admin.usergroups.addChannels({
    usergroup_id: opts.usergroupId,
    channel_ids: opts.channelIds,
    team_id: opts.teamId,
  });
}
