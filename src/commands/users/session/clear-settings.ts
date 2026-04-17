import type { WebClient } from "@slack/web-api";

interface SessionClearSettingsOptions {
  userIds: [string, ...string[]];
}

export async function executeUsersSessionClearSettings(
  client: WebClient,
  opts: SessionClearSettingsOptions,
): Promise<void> {
  await client.admin.users.session.clearSettings({ user_ids: opts.userIds });
}
