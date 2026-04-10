import type { ScimClient } from "../../scim-client";

interface ScimGroupsDeleteOptions {
  id: string;
}

export async function executeScimGroupsDelete(
  client: ScimClient,
  opts: ScimGroupsDeleteOptions,
): Promise<void> {
  await client.groups.delete(opts.id);
}
