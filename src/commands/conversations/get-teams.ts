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
  const params: Record<string, unknown> = { channel_id: opts.channelId };
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.conversations.getTeams(params);
  const teams: string[] = response.teams ?? [];
  return teams;
}
