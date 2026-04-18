import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsEnable } from "../../../src/commands/usergroups/enable";

describe("usergroups enable", () => {
  test("enables usergroup", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, usergroup: { id: "S001" } }));
    const client = { usergroups: { enable: mockCall } } as any;
    await executeUsergroupsEnable(client, { usergroup: "S001", includeCount: true, teamId: "T001" });
    expect(mockCall).toHaveBeenCalledWith({ usergroup: "S001", include_count: true, team_id: "T001" });
  });
});
