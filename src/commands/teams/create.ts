import type { WebClient } from "@slack/web-api";

export type TeamDiscoverability = "open" | "closed" | "invite_only" | "unlisted";

interface TeamsCreateOptions {
  teamDomain: string;
  teamName: string;
  teamDescription?: string;
  teamDiscoverability?: TeamDiscoverability;
}

export async function executeTeamsCreate(
  client: WebClient,
  opts: TeamsCreateOptions,
) {
  const params: Parameters<typeof client.admin.teams.create>[0] = {
    team_domain: opts.teamDomain,
    team_name: opts.teamName,
  };
  if (opts.teamDescription !== undefined) {
    params.team_description = opts.teamDescription;
  }
  if (opts.teamDiscoverability !== undefined) {
    params.team_discoverability = opts.teamDiscoverability;
  }
  return await client.admin.teams.create(params);
}
