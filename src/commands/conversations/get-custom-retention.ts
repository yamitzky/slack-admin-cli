import type { WebClient } from "@slack/web-api";

export async function executeConversationsGetCustomRetention(
  client: WebClient,
  args: { channelId: string },
) {
  return await client.admin.conversations.getCustomRetention({ channel_id: args.channelId });
}
