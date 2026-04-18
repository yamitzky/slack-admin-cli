import type { WebClient } from "@slack/web-api";

interface UsersProfileSetOptions {
  user?: string;
  name?: string;
  value?: string;
  profile?: Record<string, unknown>;
}

export async function executeUsersProfileSet(client: WebClient, opts: UsersProfileSetOptions) {
  const params: Record<string, unknown> = {};
  if (opts.user !== undefined) params.user = opts.user;
  if (opts.name !== undefined) params.name = opts.name;
  if (opts.value !== undefined) params.value = opts.value;
  if (opts.profile !== undefined) params.profile = opts.profile;
  await client.users.profile.set(params);
}
