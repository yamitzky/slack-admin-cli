import type { WebClient } from "@slack/web-api";

interface UsersSetExpirationOptions {
  userId: string;
  expirationTs: number;
  teamId?: string;
}

export async function executeUsersSetExpiration(
  client: WebClient,
  opts: UsersSetExpirationOptions,
): Promise<void> {
  await client.admin.users.setExpiration({
    user_id: opts.userId,
    expiration_ts: opts.expirationTs,
    team_id: opts.teamId,
  });
}
