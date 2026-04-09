import { describe, expect, test, mock } from "bun:test";
import { executeScimGroupsDelete } from "../../../src/commands/scim-groups/delete";

describe("scim-groups delete", () => {
  test("calls delete with group id", async () => {
    const mockDelete = mock(() => Promise.resolve(undefined));
    const client = { groups: { delete: mockDelete } } as any;
    await executeScimGroupsDelete(client, { id: "G001" });
    expect(mockDelete).toHaveBeenCalledWith("G001");
  });
});
