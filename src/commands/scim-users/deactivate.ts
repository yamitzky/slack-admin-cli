import type { ScimClient } from "../../scim-client";

interface ScimUsersDeactivateOptions {
  id: string;
}

export async function executeScimUsersDeactivate(
  client: ScimClient,
  opts: ScimUsersDeactivateOptions,
): Promise<void> {
  await client.users.deactivate(opts.id);
}
