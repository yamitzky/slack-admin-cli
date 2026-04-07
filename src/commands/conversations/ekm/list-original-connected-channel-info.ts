import type { WebClient } from "@slack/web-api";

interface EkmListOptions {
  teamIds?: string[];
  channelIds?: string[];
  cursor?: string;
  limit?: number;
}

export async function executeEkmListOriginalConnectedChannelInfo(
  client: WebClient,
  opts: EkmListOptions,
) {
  const params: Record<string, unknown> = {};
  if (opts.teamIds !== undefined) params.team_ids = opts.teamIds;
  if (opts.channelIds !== undefined) params.channel_ids = opts.channelIds;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  return await client.admin.conversations.ekm.listOriginalConnectedChannelInfo(params);
}
