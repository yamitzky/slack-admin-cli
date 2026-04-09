import type { ScimClient } from "../../scim-client";
import type { ScimGroup } from "../../scim-types";

interface ScimGroupsCreateOptions {
  displayName: string;
  memberIds?: string[];
}

export async function executeScimGroupsCreate(
  client: ScimClient,
  opts: ScimGroupsCreateOptions,
): Promise<ScimGroup> {
  return client.groups.create(opts);
}
