import type { WebClient } from "@slack/web-api";

export async function executeConversationsConvertToPublic(
  client: WebClient,
  args: { channelId: string },
): Promise<void> {
  await client.admin.conversations.convertToPublic({ channel_id: args.channelId });
}
