import type { WebClient } from "@slack/web-api";

export async function executeUsersRemove(client: WebClient, opts: { teamId: string; userId: string }) {
  return await client.admin.users.remove({ team_id: opts.teamId, user_id: opts.userId });
}
