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
    const currentTeams: string[] = response.teams ?? [];
    const targetSet = new Set(opts.targetTeamIds);
    const disconnecting = currentTeams.filter((t) => !targetSet.has(t));

    if (disconnecting.length > 0 && !opts.allowDisconnect) {
      throw new Error(
        `The following workspaces would be disconnected: ${disconnecting.join(", ")}. ` +
        `Use --allow-disconnect to confirm.`,
      );
    }
  }

  const params: Record<string, unknown> = { channel_id: opts.channelId };
  if (opts.targetTeamIds !== undefined) params.target_team_ids = opts.targetTeamIds;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.orgChannel !== undefined) params.org_channel = opts.orgChannel;

  await client.admin.conversations.setTeams(params);
}
