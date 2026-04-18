import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsUsersList } from "../../../../src/commands/usergroups/users/list";

describe("usergroups users list", () => {
  test("returns users array", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, users: ["U001", "U002"] }));
    const client = { usergroups: { users: { list: mockCall } } } as any;
    const result = await executeUsergroupsUsersList(client, { usergroup: "S001" });
    expect(result).toEqual(["U001", "U002"]);
    expect(mockCall).toHaveBeenCalledWith({ usergroup: "S001" });
  });
});
