import type { ScimClient } from "../../scim-client";
import type { ScimUser } from "../../scim-types";

interface ScimUsersCreateOptions {
  userName: string;
  email: string;
  givenName?: string;
  familyName?: string;
  displayName?: string;
}

export async function executeScimUsersCreate(
  client: ScimClient,
  opts: ScimUsersCreateOptions,
): Promise<ScimUser> {
  return client.users.create(opts);
}
