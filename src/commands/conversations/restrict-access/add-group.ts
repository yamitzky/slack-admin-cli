import type { WebClient } from "@slack/web-api";

export async function executeRestrictAccessAddGroup(
  client: WebClient,
  args: { channelId: string; groupId: string; teamId?: string },
): Promise<void> {
  await client.admin.conversations.restrictAccess.addGroup({
    channel_id: args.channelId,
    group_id: args.groupId,
    ...(args.teamId !== undefined ? { team_id: args.teamId } : {}),
  });
}
