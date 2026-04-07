import type { WebClient } from "@slack/web-api";

export async function executeConversationsRemoveCustomRetention(
  client: WebClient,
  args: { channelId: string },
): Promise<void> {
  await client.admin.conversations.removeCustomRetention({ channel_id: args.channelId });
}
