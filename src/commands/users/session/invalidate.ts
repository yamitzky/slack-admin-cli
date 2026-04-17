import type { WebClient } from "@slack/web-api";

interface SessionInvalidateOptions {
  teamId: string;
  sessionId: string;
}

export async function executeUsersSessionInvalidate(
  client: WebClient,
  opts: SessionInvalidateOptions,
): Promise<void> {
  await client.admin.users.session.invalidate({
    team_id: opts.teamId,
    session_id: opts.sessionId,
  });
}
