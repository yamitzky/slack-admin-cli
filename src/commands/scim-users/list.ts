import type { ScimClient } from "../../scim-client";
import type { ScimUser } from "../../scim-types";

interface ScimUsersListOptions {
  startIndex?: number;
  count?: number;
  filter?: string;
}

export async function executeScimUsersList(
  client: ScimClient,
  opts: ScimUsersListOptions,
): Promise<ScimUser[]> {
  const response = await client.users.list(opts);
  return response.Resources;
}
