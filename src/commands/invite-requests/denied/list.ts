import type { WebClient } from "@slack/web-api";

interface InviteRequestsDeniedListOptions {
  teamId: string;
  cursor?: string;
  limit?: number;
}

export async function executeInviteRequestsDeniedList(
  client: WebClient,
  opts: InviteRequestsDeniedListOptions,
) {
  const response = await client.admin.inviteRequests.denied.list({
    team_id: opts.teamId,
    ...(opts.cursor !== undefined ? { cursor: opts.cursor } : {}),
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
  });
  return response.denied_requests ?? [];
}
