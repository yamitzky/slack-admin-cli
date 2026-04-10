import type { ScimClient } from "../../scim-client";
import type { ScimPatchOperation, ScimGroup } from "../../scim-types";

interface ScimGroupsUpdateOptions {
  id: string;
  displayName?: string;
  addMemberIds?: string[];
  removeMemberIds?: string[];
}

export async function executeScimGroupsUpdate(
  client: ScimClient,
  opts: ScimGroupsUpdateOptions,
): Promise<ScimGroup> {
  const operations: ScimPatchOperation[] = [];

  if (opts.displayName !== undefined) {
    operations.push({ op: "replace", path: "displayName", value: opts.displayName });
  }
  if (opts.addMemberIds !== undefined) {
    for (const memberId of opts.addMemberIds) {
      operations.push({ op: "add", path: "members", value: [{ value: memberId }] });
    }
  }
  if (opts.removeMemberIds !== undefined) {
    for (const memberId of opts.removeMemberIds) {
      operations.push({ op: "remove", path: `members[value eq "${memberId}"]` });
    }
  }

  if (operations.length === 0) {
    throw new Error("At least one field to update must be specified");
  }

  return client.groups.update(opts.id, operations);
}
