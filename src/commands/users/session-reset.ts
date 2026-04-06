import type { WebClient } from "@slack/web-api";

interface SessionResetOptions {
  userId: string;
  mobileOnly?: boolean;
  webOnly?: boolean;
}

export async function executeSessionReset(client: WebClient, opts: SessionResetOptions) {
  return await client.admin.users.session.reset({
    user_id: opts.userId,
    ...(opts.mobileOnly !== undefined ? { mobile_only: opts.mobileOnly } : {}),
    ...(opts.webOnly !== undefined ? { web_only: opts.webOnly } : {}),
  });
}
