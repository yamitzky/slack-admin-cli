import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsUsersUpdate } from "../../../../src/commands/usergroups/users/update";

describe("usergroups users update", () => {
  test("updates user list", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, usergroup: { id: "S001" } }));
    const client = { usergroups: { users: { update: mockCall } } } as any;
    await executeUsergroupsUsersUpdate(client, { usergroup: "S001", users: "U001,U002", includeCount: true, teamId: "T001" });
    expect(mockCall).toHaveBeenCalledWith({
      usergroup: "S001", users: "U001,U002", include_count: true, team_id: "T001",
    });
  });
});
