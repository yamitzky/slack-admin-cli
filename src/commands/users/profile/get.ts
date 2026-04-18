import type { WebClient } from "@slack/web-api";

interface UsersProfileGetOptions {
  user?: string;
  includeLabels?: boolean;
}

export async function executeUsersProfileGet(client: WebClient, opts: UsersProfileGetOptions) {
  const params: Record<string, unknown> = {};
  if (opts.user !== undefined) params.user = opts.user;
  if (opts.includeLabels !== undefined) params.include_labels = opts.includeLabels;
  const response = await client.users.profile.get(params);
  return response.profile;
}
