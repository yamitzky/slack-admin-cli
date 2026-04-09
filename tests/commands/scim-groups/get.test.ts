import { describe, expect, test, mock } from "bun:test";
import { executeScimGroupsGet } from "../../../src/commands/scim-groups/get";

describe("scim-groups get", () => {
  test("returns group by id", async () => {
    const group = { id: "G001", displayName: "Engineering", members: [{ value: "U001", display: "alice" }] };
    const mockGet = mock(() => Promise.resolve(group));
    const client = { groups: { get: mockGet } } as any;
    const result = await executeScimGroupsGet(client, { id: "G001" });
    expect(result.id).toBe("G001");
    expect(result.displayName).toBe("Engineering");
    expect(mockGet).toHaveBeenCalledWith("G001");
  });
});
