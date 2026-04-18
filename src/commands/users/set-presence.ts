import type { WebClient } from "@slack/web-api";

interface UsersSetPresenceOptions {
  presence: "auto" | "away";
}

export async function executeUsersSetPresence(client: WebClient, opts: UsersSetPresenceOptions) {
  await client.users.setPresence({ presence: opts.presence });
}
