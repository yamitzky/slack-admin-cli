import type { WebClient } from "@slack/web-api";

export async function executeConversationsBulkMove(
  client: WebClient,
  args: { channelIds: [string, ...string[]]; targetTeamId: string },
): Promise<void> {
  await client.admin.conversations.bulkMove({
    channel_ids: args.channelIds,
    target_team_id: args.targetTeamId,
  });
}
