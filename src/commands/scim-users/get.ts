import type { ScimClient } from "../../scim-client";
import type { ScimUser } from "../../scim-types";

interface ScimUsersGetOptions {
  id: string;
}

export async function executeScimUsersGet(
  client: ScimClient,
  opts: ScimUsersGetOptions,
): Promise<ScimUser> {
  return client.users.get(opts.id);
}
