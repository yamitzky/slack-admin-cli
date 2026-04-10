import { describe, expect, test, mock } from "bun:test";
import { executeScimGroupsCreate } from "../../../src/commands/scim-groups/create";

describe("scim-groups create", () => {
  test("creates group with display name only", async () => {
    const created = { id: "G999", displayName: "New Team", members: [] };
    const mockCreate = mock(() => Promise.resolve(created));
    const client = { groups: { create: mockCreate } } as any;
    const result = await executeScimGroupsCreate(client, { displayName: "New Team" });
    expect(result.id).toBe("G999");
    expect(mockCreate).toHaveBeenCalledWith({ displayName: "New Team" });
  });

  test("creates group with members", async () => {
    const created = { id: "G999", displayName: "New Team", members: [{ value: "U001" }, { value: "U002" }] };
    const mockCreate = mock(() => Promise.resolve(created));
    const client = { groups: { create: mockCreate } } as any;
    await executeScimGroupsCreate(client, { displayName: "New Team", memberIds: ["U001", "U002"] });
    expect(mockCreate).toHaveBeenCalledWith({ displayName: "New Team", memberIds: ["U001", "U002"] });
  });
});
