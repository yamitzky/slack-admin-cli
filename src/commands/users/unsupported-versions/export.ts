import type { WebClient } from "@slack/web-api";

interface UsersUnsupportedVersionsExportOptions {
  dateEndOfSupport?: number;
  dateSessionsStarted?: number;
}

export async function executeUsersUnsupportedVersionsExport(
  client: WebClient,
  opts: UsersUnsupportedVersionsExportOptions,
): Promise<void> {
  await client.admin.users.unsupportedVersions.export({
    date_end_of_support: opts.dateEndOfSupport,
    date_sessions_started: opts.dateSessionsStarted,
  });
}
