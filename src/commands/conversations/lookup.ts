import type { WebClient } from "@slack/web-api";

interface ConversationsLookupOptions {
  teamIds: string[];
  lastMessageActivityBefore: number;
  maxMemberCount?: number;
  cursor?: string;
  limit?: number;
}

export async function executeConversationsLookup(
  client: WebClient,
  opts: ConversationsLookupOptions,
) {
  const params: Record<string, unknown> = {
    team_ids: opts.teamIds,
    last_message_activity_before: opts.lastMessageActivityBefore,
  };
  if (opts.maxMemberCount !== undefined) params.max_member_count = opts.maxMemberCount;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.conversations.lookup(params);
  return response.channels ?? [];
}
