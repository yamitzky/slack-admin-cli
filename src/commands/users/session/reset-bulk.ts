import type { WebClient } from "@slack/web-api";

interface SessionResetBulkOptions {
  userIds: [string, ...string[]];
  mobileOnly?: boolean;
  webOnly?: boolean;
}

export async function executeUsersSessionResetBulk(
  client: WebClient,
  opts: SessionResetBulkOptions,
): Promise<void> {
  await client.admin.users.session.resetBulk({
    user_ids: opts.userIds,
    ...(opts.mobileOnly !== undefined ? { mobile_only: opts.mobileOnly } : {}),
    ...(opts.webOnly !== undefined ? { web_only: opts.webOnly } : {}),
  });
}
