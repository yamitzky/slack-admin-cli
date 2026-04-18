import type { WebClient } from "@slack/web-api";

interface UsersConversationsOptions {
  user?: string;
  cursor?: string;
  limit?: number;
  types?: string;
  excludeArchived?: boolean;
}

export async function executeUsersConversations(client: WebClient, opts: UsersConversationsOptions) {
  const params: Record<string, unknown> = {};
  if (opts.user !== undefined) params.user = opts.user;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  if (opts.types !== undefined) params.types = opts.types;
  if (opts.excludeArchived !== undefined) params.exclude_archived = opts.excludeArchived;
  const response = await client.users.conversations(params);
  return response.channels ?? [];
}
