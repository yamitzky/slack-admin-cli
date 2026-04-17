import type { WebClient } from "@slack/web-api";
import type { SessionSetting } from "@slack/web-api/dist/types/response/AdminUsersSessionGetSettingsResponse";

interface SessionGetSettingsOptions {
  userIds: [string, ...string[]];
}

export async function executeUsersSessionGetSettings(
  client: WebClient,
  opts: SessionGetSettingsOptions,
): Promise<SessionSetting[]> {
  const response = await client.admin.users.session.getSettings({ user_ids: opts.userIds });
  return response.session_settings ?? [];
}
