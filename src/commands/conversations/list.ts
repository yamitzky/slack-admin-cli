import type { WebClient } from "@slack/web-api";

interface ConversationsListOptions {
  cursor?: string;
  limit?: number;
  types?: string;
  excludeArchived?: boolean;
  teamId?: string;
}

export async function executeConversationsList(client: WebClient, opts: ConversationsListOptions) {
  const params: Record<string, unknown> = {};
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  if (opts.types !== undefined) params.types = opts.types;
  if (opts.excludeArchived !== undefined) params.exclude_archived = opts.excludeArchived;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  const response = await client.conversations.list(params);
  return response.channels ?? [];
}
