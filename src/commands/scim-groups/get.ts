import type { ScimClient } from "../../scim-client";
import type { ScimGroup } from "../../scim-types";

interface ScimGroupsGetOptions {
  id: string;
}

export async function executeScimGroupsGet(
  client: ScimClient,
  opts: ScimGroupsGetOptions,
): Promise<ScimGroup> {
  return client.groups.get(opts.id);
}
