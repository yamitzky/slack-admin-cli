import type { WebClient } from "@slack/web-api";

interface ConversationsInfoOptions {
  channel: string;
  includeLocale?: boolean;
  includeNumMembers?: boolean;
}

export async function executeConversationsInfo(client: WebClient, opts: ConversationsInfoOptions) {
  const params: { channel: string; include_locale?: boolean; include_num_members?: boolean } = { channel: opts.channel };
  if (opts.includeLocale !== undefined) params.include_locale = opts.includeLocale;
  if (opts.includeNumMembers !== undefined) params.include_num_members = opts.includeNumMembers;
  const response = await client.conversations.info(params);
  return response.channel;
}
