import type { WebClient } from "@slack/web-api";

export async function executeConversationsDelete(
  client: WebClient,
  args: { channelId: string },
): Promise<void> {
  await client.admin.conversations.delete({ channel_id: args.channelId });
}
