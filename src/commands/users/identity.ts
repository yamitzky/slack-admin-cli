import type { WebClient } from "@slack/web-api";

interface UsersIdentityOptions {}

export async function executeUsersIdentity(client: WebClient, _opts: UsersIdentityOptions) {
  const response = await client.users.identity({});
  return response;
}
