import type { WebClient } from "@slack/web-api";

interface ConversationsSetTeamsOptions {
  channelId: string;
  targetTeamIds?: string[];
  teamId?: string;
  orgChannel?: boolean;
  allowDisconnect: boolean;
}

export async function executeConversationsSetTeams(
  client: WebClient,
  opts: ConversationsSetTeamsOptions,
): Promise<void> {
  // When making org-wide, skip disconnect check — all workspaces get access
  if (!opts.orgChannel && opts.targetTeamIds !== undefined) {
    const response = await client.admin.conversations.getTeams({ channel_id: opts.channelId });
    const currentTeams: string[] = response.team_ids ?? [];
    const targetSet = new Set(opts.targetTeamIds);
    const disconnecting = currentTeams.filter((t) => !targetSet.has(t));

    if (disconnecting.length > 0 && !opts.allowDisconnect) {
      throw new Error(
        `The following workspaces would be disconnected: ${disconnecting.join(", ")}. ` +
        `Use --allow-disconnect to confirm.`,
      );
    }
  }

  await client.admin.conversations.setTeams({
    channel_id: opts.channelId,
    ...(opts.targetTeamIds !== undefined ? { target_team_ids: opts.targetTeamIds } : {}),
    ...(opts.teamId !== undefined ? { team_id: opts.teamId } : {}),
    ...(opts.orgChannel !== undefined ? { org_channel: opts.orgChannel } : {}),
  });
}
