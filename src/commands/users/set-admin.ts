import type { WebClient } from "@slack/web-api";

export async function executeUsersSetAdmin(client: WebClient, opts: { teamId: string; userId: string }) {
  return await client.admin.users.setAdmin({ team_id: opts.teamId, user_id: opts.userId });
}
