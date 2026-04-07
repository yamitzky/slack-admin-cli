import type { WebClient } from "@slack/web-api";

export async function executeRestrictAccessListGroups(
  client: WebClient,
  args: { channelId: string; teamId?: string },
) {
  return await client.admin.conversations.restrictAccess.listGroups({
    channel_id: args.channelId,
    ...(args.teamId !== undefined ? { team_id: args.teamId } : {}),
  });
}
