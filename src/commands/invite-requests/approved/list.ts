import type { WebClient } from "@slack/web-api";

interface InviteRequestsApprovedListOptions {
  teamId: string;
  cursor?: string;
  limit?: number;
}

export async function executeInviteRequestsApprovedList(
  client: WebClient,
  opts: InviteRequestsApprovedListOptions,
) {
  const response = await client.admin.inviteRequests.approved.list({
    team_id: opts.teamId,
    ...(opts.cursor !== undefined ? { cursor: opts.cursor } : {}),
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
  });
  return response.approved_requests ?? [];
}
