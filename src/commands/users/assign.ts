import type { WebClient } from "@slack/web-api";

interface UsersAssignOptions {
  teamId: string;
  userId: string;
  channelIds?: [string, ...string[]];
  isRestricted?: boolean;
  isUltraRestricted?: boolean;
}

export async function executeUsersAssign(client: WebClient, opts: UsersAssignOptions) {
  return await client.admin.users.assign({
    team_id: opts.teamId,
    user_id: opts.userId,
    ...(opts.channelIds !== undefined ? { channel_ids: opts.channelIds } : {}),
    ...(opts.isRestricted !== undefined ? { is_restricted: opts.isRestricted } : {}),
    ...(opts.isUltraRestricted !== undefined ? { is_ultra_restricted: opts.isUltraRestricted } : {}),
  });
}
