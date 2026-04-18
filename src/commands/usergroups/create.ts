import type { WebClient } from "@slack/web-api";

interface UsergroupsCreateOptions {
  name: string;
  handle?: string;
  description?: string;
  channels?: string;
  includeCount?: boolean;
  teamId?: string;
}

export async function executeUsergroupsCreate(client: WebClient, opts: UsergroupsCreateOptions) {
  const params: {
    name: string;
    handle?: string;
    description?: string;
    channels?: string;
    include_count?: boolean;
    team_id?: string;
  } = { name: opts.name };
  if (opts.handle !== undefined) params.handle = opts.handle;
  if (opts.description !== undefined) params.description = opts.description;
  if (opts.channels !== undefined) params.channels = opts.channels;
  if (opts.includeCount !== undefined) params.include_count = opts.includeCount;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  const response = await client.usergroups.create(params);
  return response.usergroup;
}
