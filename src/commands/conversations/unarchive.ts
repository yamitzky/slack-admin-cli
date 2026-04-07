import type { WebClient } from "@slack/web-api";

export async function executeConversationsUnarchive(
  client: WebClient,
  args: { channelId: string },
): Promise<void> {
  await client.admin.conversations.unarchive({ channel_id: args.channelId });
}
