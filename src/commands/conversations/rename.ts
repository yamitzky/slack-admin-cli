import type { WebClient } from "@slack/web-api";

export async function executeConversationsRename(
  client: WebClient,
  args: { channelId: string; name: string },
): Promise<void> {
  await client.admin.conversations.rename({ channel_id: args.channelId, name: args.name });
}
