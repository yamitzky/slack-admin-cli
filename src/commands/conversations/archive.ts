import type { WebClient } from "@slack/web-api";

export async function executeConversationsArchive(
  client: WebClient,
  args: { channelId: string },
): Promise<void> {
  await client.admin.conversations.archive({ channel_id: args.channelId });
}
