import type { WebClient } from "@slack/web-api";

interface UsersInviteOptions {
  teamId: string;
  email: string;
  channelIds: string;
  customMessage?: string;
  realName?: string;
  isRestricted?: boolean;
  isUltraRestricted?: boolean;
  guestExpirationTs?: string;
  resend?: boolean;
}

export async function executeUsersInvite(client: WebClient, opts: UsersInviteOptions) {
  // SDK型定義は channel_ids: [string, ...string[]] だが、実際のAPIはカンマ区切り文字列を期待する
  return await client.admin.users.invite({
    team_id: opts.teamId,
    email: opts.email,
    channel_ids: opts.channelIds as unknown as [string, ...string[]],
    ...(opts.customMessage !== undefined ? { custom_message: opts.customMessage } : {}),
    ...(opts.realName !== undefined ? { real_name: opts.realName } : {}),
    ...(opts.isRestricted !== undefined ? { is_restricted: opts.isRestricted } : {}),
    ...(opts.isUltraRestricted !== undefined ? { is_ultra_restricted: opts.isUltraRestricted } : {}),
    ...(opts.guestExpirationTs !== undefined ? { guest_expiration_ts: opts.guestExpirationTs } : {}),
    ...(opts.resend !== undefined ? { resend: opts.resend } : {}),
  });
}
