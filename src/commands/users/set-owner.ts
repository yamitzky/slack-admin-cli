import type { WebClient } from "@slack/web-api";

export async function executeUsersSetOwner(client: WebClient, opts: { teamId: string; userId: string }) {
  return await client.admin.users.setOwner({ team_id: opts.teamId, user_id: opts.userId });
}
