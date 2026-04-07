import type { WebClient } from "@slack/web-api";

export async function executeConversationsGetPrefs(
  client: WebClient,
  args: { channelId: string },
) {
  const response = await client.admin.conversations.getConversationPrefs({ channel_id: args.channelId });
  return response.prefs;
}
