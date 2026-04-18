import type { WebClient } from "@slack/web-api";

interface UsersGetPresenceOptions {
  user: string;
}

export async function executeUsersGetPresence(client: WebClient, opts: UsersGetPresenceOptions) {
  const response = await client.users.getPresence({ user: opts.user });
  return response;
}
