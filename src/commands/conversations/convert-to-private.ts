import type { WebClient } from "@slack/web-api";

export async function executeConversationsConvertToPrivate(
  client: WebClient,
  args: { channelId: string; name?: string },
): Promise<void> {
  await client.admin.conversations.convertToPrivate({
    channel_id: args.channelId,
    ...(args.name !== undefined ? { name: args.name } : {}),
  });
}
