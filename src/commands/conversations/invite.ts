import type { WebClient } from "@slack/web-api";

export async function executeConversationsInvite(
  client: WebClient,
  args: { channelId: string; userIds: [string, ...string[]] },
): Promise<void> {
  await client.admin.conversations.invite({
    channel_id: args.channelId,
    user_ids: args.userIds,
  });
}
