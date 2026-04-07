import type { WebClient } from "@slack/web-api";

interface ConversationsLookupOptions {
  teamIds: [string, ...string[]];
  lastMessageActivityBefore: number;
  maxMemberCount?: number;
  cursor?: string;
  limit?: number;
}

export async function executeConversationsLookup(
  client: WebClient,
  opts: ConversationsLookupOptions,
) {
  const response = await client.admin.conversations.lookup({
    team_ids: opts.teamIds,
    last_message_activity_before: opts.lastMessageActivityBefore,
    ...(opts.maxMemberCount !== undefined ? { max_member_count: opts.maxMemberCount } : {}),
    ...(opts.cursor !== undefined ? { cursor: opts.cursor } : {}),
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
  });
  return response.channel_ids ?? [];
}
