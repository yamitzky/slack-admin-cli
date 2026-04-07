import type { WebClient } from "@slack/web-api";

export async function executeInviteRequestsDeny(
  client: WebClient,
  args: { inviteRequestId: string; teamId: string },
): Promise<void> {
  await client.admin.inviteRequests.deny({
    invite_request_id: args.inviteRequestId,
    team_id: args.teamId,
  });
}
