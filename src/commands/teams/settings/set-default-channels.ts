import type { WebClient } from "@slack/web-api";

interface SetDefaultChannelsOptions {
  teamId: string;
  channelIds: [string, ...string[]];
}

export async function executeSetDefaultChannels(
  client: WebClient,
  opts: SetDefaultChannelsOptions,
): Promise<void> {
  await client.admin.teams.settings.setDefaultChannels({
    team_id: opts.teamId,
    channel_ids: opts.channelIds,
  });
}
