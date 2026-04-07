import type { WebClient } from "@slack/web-api";

export async function executeConversationsDisconnectShared(
  client: WebClient,
  args: { channelId: string; leavingTeamIds?: string[] },
): Promise<void> {
  await client.admin.conversations.disconnectShared({
    channel_id: args.channelId,
    ...(args.leavingTeamIds !== undefined ? { leaving_team_ids: args.leavingTeamIds } : {}),
  });
}
