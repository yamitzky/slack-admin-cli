import type { WebClient } from "@slack/web-api";

export async function executeConversationsSetCustomRetention(
  client: WebClient,
  args: { channelId: string; durationDays: number },
): Promise<void> {
  await client.admin.conversations.setCustomRetention({
    channel_id: args.channelId,
    duration_days: args.durationDays,
  });
}
