import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsAddTeams } from "../../../src/commands/usergroups/add-teams";

describe("usergroups add-teams", () => {
  test("calls admin.usergroups.addTeams with snake_case params", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { usergroups: { addTeams: mockFn } } } as any;
    await executeUsergroupsAddTeams(client, {
      usergroupId: "S001",
      teamIds: ["T001", "T002"],
      autoProvision: true,
    });
    expect(mockFn).toHaveBeenCalledWith({
      usergroup_id: "S001",
      team_ids: ["T001", "T002"],
      auto_provision: true,
    });
  });

  test("omits auto_provision when undefined", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { usergroups: { addTeams: mockFn } } } as any;
    await executeUsergroupsAddTeams(client, {
      usergroupId: "S001",
      teamIds: ["T001"],
    });
    expect(mockFn).toHaveBeenCalledWith({
      usergroup_id: "S001",
      team_ids: ["T001"],
      auto_provision: undefined,
    });
  });
});
