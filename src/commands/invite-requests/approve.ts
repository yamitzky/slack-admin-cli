import type { WebClient } from "@slack/web-api";

export async function executeInviteRequestsApprove(
  client: WebClient,
  args: { inviteRequestId: string; teamId: string },
): Promise<void> {
  await client.admin.inviteRequests.approve({
    invite_request_id: args.inviteRequestId,
    team_id: args.teamId,
  });
}
