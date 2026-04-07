import type { WebClient } from "@slack/web-api";

interface ConversationsGetTeamsOptions {
  channelId: string;
  cursor?: string;
  limit?: number;
}

export async function executeConversationsGetTeams(
  client: WebClient,
  opts: ConversationsGetTeamsOptions,
): Promise<string[]> {
  const response = await client.admin.conversations.getTeams({
    channel_id: opts.channelId,
    ...(opts.cursor !== undefined ? { cursor: opts.cursor } : {}),
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
  });
  return response.team_ids ?? [];
}
