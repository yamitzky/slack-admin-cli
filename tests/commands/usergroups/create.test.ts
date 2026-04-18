import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsCreate } from "../../../src/commands/usergroups/create";

describe("usergroups create", () => {
  test("creates with all options", async () => {
    const mockCreate = mock(() => Promise.resolve({ ok: true, usergroup: { id: "S001" } }));
    const client = { usergroups: { create: mockCreate } } as any;
    const result = await executeUsergroupsCreate(client, {
      name: "devs", handle: "devs", description: "devteam",
      channels: "C001,C002", includeCount: true, teamId: "T001",
    });
    expect(result?.id).toBe("S001");
    expect(mockCreate).toHaveBeenCalledWith({
      name: "devs", handle: "devs", description: "devteam",
      channels: "C001,C002", include_count: true, team_id: "T001",
    });
  });
});
