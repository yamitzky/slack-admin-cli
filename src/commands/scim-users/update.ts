import type { ScimClient } from "../../scim-client";
import type { ScimPatchOperation, ScimUser } from "../../scim-types";

interface ScimUsersUpdateOptions {
  id: string;
  active?: boolean;
  userName?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  displayName?: string;
  title?: string;
}

export async function executeScimUsersUpdate(
  client: ScimClient,
  opts: ScimUsersUpdateOptions,
): Promise<ScimUser> {
  const operations: ScimPatchOperation[] = [];

  if (opts.active !== undefined) operations.push({ op: "replace", path: "active", value: opts.active });
  if (opts.userName !== undefined) operations.push({ op: "replace", path: "userName", value: opts.userName });
  if (opts.email !== undefined) operations.push({ op: "replace", path: "emails", value: [{ value: opts.email, primary: true }] });
  if (opts.givenName !== undefined) operations.push({ op: "replace", path: "name.givenName", value: opts.givenName });
  if (opts.familyName !== undefined) operations.push({ op: "replace", path: "name.familyName", value: opts.familyName });
  if (opts.displayName !== undefined) operations.push({ op: "replace", path: "displayName", value: opts.displayName });
  if (opts.title !== undefined) operations.push({ op: "replace", path: "title", value: opts.title });

  if (operations.length === 0) {
    throw new Error("At least one field to update must be specified");
  }

  return client.users.update(opts.id, operations);
}
