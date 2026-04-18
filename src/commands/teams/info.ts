import type { WebClient } from "@slack/web-api";

interface TeamsInfoOptions {
  team?: string;
  domain?: string;
}

export async function executeTeamsInfo(client: WebClient, opts: TeamsInfoOptions) {
  const params: Record<string, unknown> = {};
  if (opts.team !== undefined) params.team = opts.team;
  if (opts.domain !== undefined) params.domain = opts.domain;
  const response = await client.team.info(params);
  return response.team;
}
