import type { WebClient } from "@slack/web-api";

interface InviteRequestsListOptions {
  teamId: string;
  cursor?: string;
  limit?: number;
}

export async function executeInviteRequestsList(
  client: WebClient,
  opts: InviteRequestsListOptions,
) {
  const response = await client.admin.inviteRequests.list({
    team_id: opts.teamId,
    ...(opts.cursor !== undefined ? { cursor: opts.cursor } : {}),
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
  });
  return response.invite_requests ?? [];
}
