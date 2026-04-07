import type { WebClient } from "@slack/web-api";

interface ConversationsSearchOptions {
  query?: string;
  teamIds?: string[];
  connectedTeamIds?: string[];
  searchChannelTypes?: string[];
  sort?: string;
  sortDir?: string;
  totalCountOnly?: boolean;
  cursor?: string;
  limit?: number;
}

export async function executeConversationsSearch(
  client: WebClient,
  opts: ConversationsSearchOptions,
) {
  const params: Record<string, unknown> = {};
  if (opts.query !== undefined) params.query = opts.query;
  if (opts.teamIds !== undefined) params.team_ids = opts.teamIds;
  if (opts.connectedTeamIds !== undefined) params.connected_team_ids = opts.connectedTeamIds;
  if (opts.searchChannelTypes !== undefined) params.search_channel_types = opts.searchChannelTypes;
  if (opts.sort !== undefined) params.sort = opts.sort;
  if (opts.sortDir !== undefined) params.sort_dir = opts.sortDir;
  if (opts.totalCountOnly !== undefined) params.total_count_only = opts.totalCountOnly;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.conversations.search(params);
  return response.conversations ?? [];
}
