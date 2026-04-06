import type { WebClient } from "@slack/web-api";

export async function executeUsersSetRegular(client: WebClient, opts: { teamId: string; userId: string }) {
  return await client.admin.users.setRegular({ team_id: opts.teamId, user_id: opts.userId });
}
