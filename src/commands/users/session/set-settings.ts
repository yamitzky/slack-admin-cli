import type { WebClient } from "@slack/web-api";

interface SessionSetSettingsOptions {
  userIds: [string, ...string[]];
  desktopAppBrowserQuit?: boolean;
  duration?: number;
}

export async function executeUsersSessionSetSettings(
  client: WebClient,
  opts: SessionSetSettingsOptions,
): Promise<void> {
  await client.admin.users.session.setSettings({
    user_ids: opts.userIds,
    ...(opts.desktopAppBrowserQuit !== undefined
      ? { desktop_app_browser_quit: opts.desktopAppBrowserQuit }
      : {}),
    ...(opts.duration !== undefined ? { duration: opts.duration } : {}),
  });
}
