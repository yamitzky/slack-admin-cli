import type { WebClient } from "@slack/web-api";

export async function executeConversationsBulkArchive(
  client: WebClient,
  args: { channelIds: string[] },
): Promise<void> {
  await client.admin.conversations.bulkArchive({ channel_ids: args.channelIds });
}
