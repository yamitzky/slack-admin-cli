import type { WebClient } from "@slack/web-api";

interface UsersInviteOptions {
  teamId: string;
  email: string;
  channelIds: [string, ...string[]];
  customMessage?: string;
  realName?: string;
  isRestricted?: boolean;
  isUltraRestricted?: boolean;
  guestExpirationTs?: string;
  resend?: boolean;
}

export async function executeUsersInvite(client: WebClient, opts: UsersInviteOptions) {
  return await client.admin.users.invite({
    team_id: opts.teamId,
    email: opts.email,
    channel_ids: opts.channelIds,
    ...(opts.customMessage !== undefined ? { custom_message: opts.customMessage } : {}),
    ...(opts.realName !== undefined ? { real_name: opts.realName } : {}),
    ...(opts.isRestricted !== undefined ? { is_restricted: opts.isRestricted } : {}),
    ...(opts.isUltraRestricted !== undefined ? { is_ultra_restricted: opts.isUltraRestricted } : {}),
    ...(opts.guestExpirationTs !== undefined ? { guest_expiration_ts: opts.guestExpirationTs } : {}),
    ...(opts.resend !== undefined ? { resend: opts.resend } : {}),
  });
}
