import type { WebClient } from "@slack/web-api";

interface ConversationsMembersOptions {
  channel: string;
  cursor?: string;
  limit?: number;
}

export async function executeConversationsMembers(client: WebClient, opts: ConversationsMembersOptions) {
  const params: { channel: string; cursor?: string; limit?: number } = { channel: opts.channel };
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  const response = await client.conversations.members(params);
  return response.members ?? [];
}
