import type { WebClient } from "@slack/web-api";

interface UsersAssignOptions {
  teamId: string;
  userId: string;
  channelIds?: string[];
  isRestricted?: boolean;
  isUltraRestricted?: boolean;
}

export async function executeUsersAssign(client: WebClient, opts: UsersAssignOptions) {
  const params: Record<string, unknown> = {
    team_id: opts.teamId,
    user_id: opts.userId,
  };
  if (opts.channelIds !== undefined) params.channel_ids = opts.channelIds;
  if (opts.isRestricted !== undefined) params.is_restricted = opts.isRestricted;
  if (opts.isUltraRestricted !== undefined) params.is_ultra_restricted = opts.isUltraRestricted;

  return await client.admin.users.assign(params);
}
