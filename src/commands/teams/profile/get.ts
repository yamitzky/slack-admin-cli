import type { WebClient } from "@slack/web-api";

interface TeamsProfileGetOptions {
  visibility?: string;
}

export async function executeTeamsProfileGet(client: WebClient, opts: TeamsProfileGetOptions) {
  const params: Record<string, unknown> = {};
  if (opts.visibility !== undefined) params.visibility = opts.visibility;
  const response = await client.team.profile.get(params);
  return response.profile;
}
