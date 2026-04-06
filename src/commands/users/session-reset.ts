import type { WebClient } from "@slack/web-api";

interface SessionResetOptions {
  userId: string;
  mobileOnly?: boolean;
  webOnly?: boolean;
}

export async function executeSessionReset(client: WebClient, opts: SessionResetOptions) {
  const params: Record<string, unknown> = {
    user_id: opts.userId,
  };
  if (opts.mobileOnly !== undefined) params.mobile_only = opts.mobileOnly;
  if (opts.webOnly !== undefined) params.web_only = opts.webOnly;

  return await client.admin.users.session.reset(params);
}
