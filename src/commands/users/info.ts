import type { WebClient } from "@slack/web-api";

interface UsersInfoOptions {
  user: string;
  includeLocale?: boolean;
}

export async function executeUsersInfo(client: WebClient, opts: UsersInfoOptions) {
  const params: { user: string; include_locale?: boolean } = { user: opts.user };
  if (opts.includeLocale !== undefined) params.include_locale = opts.includeLocale;
  const response = await client.users.info(params);
  return response.user;
}
