import type { WebClient } from "@slack/web-api";

export async function executeConversationsSetPrefs(
  client: WebClient,
  args: { channelId: string; prefs: Record<string, unknown> },
): Promise<void> {
  await client.admin.conversations.setConversationPrefs({
    channel_id: args.channelId,
    prefs: args.prefs,
  });
}
