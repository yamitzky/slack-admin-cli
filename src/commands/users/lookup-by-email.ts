import type { WebClient } from "@slack/web-api";

interface UsersLookupByEmailOptions {
  email: string;
}

export async function executeUsersLookupByEmail(client: WebClient, opts: UsersLookupByEmailOptions) {
  const response = await client.users.lookupByEmail({ email: opts.email });
  return response.user;
}
