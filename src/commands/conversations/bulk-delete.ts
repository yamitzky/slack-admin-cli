import type { WebClient } from "@slack/web-api";

export async function executeConversationsBulkDelete(
  client: WebClient,
  args: { channelIds: string[] },
): Promise<void> {
  await client.admin.conversations.bulkDelete({ channel_ids: args.channelIds });
}
