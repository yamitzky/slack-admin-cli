import type { WebClient } from "@slack/web-api";

interface UsergroupsListChannelsOptions {
  usergroupId: string;
  teamId?: string;
  includeNumMembers?: boolean;
}

export interface UsergroupChannel {
  id?: string;
  name?: string;
  num_members?: number;
}

export async function executeUsergroupsListChannels(
  client: WebClient,
  opts: UsergroupsListChannelsOptions,
): Promise<UsergroupChannel[]> {
  const response = await client.admin.usergroups.listChannels({
    usergroup_id: opts.usergroupId,
    team_id: opts.teamId,
    include_num_members: opts.includeNumMembers,
  });
  const channels = response.channels ?? [];
  return channels.map((c) => {
    const numMembers = (c as { num_members?: number }).num_members;
    return { id: c.id, name: c.name, num_members: numMembers };
  });
}
