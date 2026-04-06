import type { WebClient } from "@slack/web-api";

interface UsersInviteOptions {
  teamId: string;
  email: string;
  channelIds: string[];
  customMessage?: string;
  realName?: string;
  isRestricted?: boolean;
  isUltraRestricted?: boolean;
  guestExpirationTs?: string;
  resend?: boolean;
}

export async function executeUsersInvite(client: WebClient, opts: UsersInviteOptions) {
  const params: Record<string, unknown> = {
    team_id: opts.teamId,
    email: opts.email,
    channel_ids: opts.channelIds,
  };
  if (opts.customMessage !== undefined) params.custom_message = opts.customMessage;
  if (opts.realName !== undefined) params.real_name = opts.realName;
  if (opts.isRestricted !== undefined) params.is_restricted = opts.isRestricted;
  if (opts.isUltraRestricted !== undefined) params.is_ultra_restricted = opts.isUltraRestricted;
  if (opts.guestExpirationTs !== undefined) params.guest_expiration_ts = opts.guestExpirationTs;
  if (opts.resend !== undefined) params.resend = opts.resend;

  return await client.admin.users.invite(params);
}
