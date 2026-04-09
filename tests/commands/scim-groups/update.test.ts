import { describe, expect, test, mock } from "bun:test";
import { executeScimGroupsUpdate } from "../../../src/commands/scim-groups/update";

describe("scim-groups update", () => {
  test("builds replace operation for displayName", async () => {
    const updated = { id: "G001", displayName: "New Name", members: [] };
    const mockUpdate = mock(() => Promise.resolve(updated));
    const client = { groups: { update: mockUpdate } } as any;
    await executeScimGroupsUpdate(client, { id: "G001", displayName: "New Name" });
    expect(mockUpdate).toHaveBeenCalledWith("G001", [
      { op: "replace", path: "displayName", value: "New Name" },
    ]);
  });

  test("builds add and remove operations for members", async () => {
    const updated = { id: "G001", displayName: "Eng", members: [{ value: "U002" }, { value: "U003" }] };
    const mockUpdate = mock(() => Promise.resolve(updated));
    const client = { groups: { update: mockUpdate } } as any;
    await executeScimGroupsUpdate(client, { id: "G001", addMemberIds: ["U003"], removeMemberIds: ["U001"] });
    expect(mockUpdate).toHaveBeenCalledWith("G001", [
      { op: "add", path: "members", value: [{ value: "U003" }] },
      { op: "remove", path: "members[value eq \"U001\"]" },
    ]);
  });

  test("throws when no fields provided", async () => {
    const client = { groups: { update: mock(() => Promise.resolve({})) } } as any;
    await expect(executeScimGroupsUpdate(client, { id: "G001" })).rejects.toThrow(
      "At least one field to update must be specified",
    );
  });
});
