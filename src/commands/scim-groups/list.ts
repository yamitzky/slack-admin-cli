import type { ScimClient } from "../../scim-client";
import type { ScimGroup } from "../../scim-types";

interface ScimGroupsListOptions {
  startIndex?: number;
  count?: number;
  filter?: string;
}

export async function executeScimGroupsList(
  client: ScimClient,
  opts: ScimGroupsListOptions,
): Promise<ScimGroup[]> {
  const response = await client.groups.list(opts);
  return response.Resources;
}
