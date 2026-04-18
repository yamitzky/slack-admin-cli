import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsList } from "../../../src/commands/usergroups/list";

describe("usergroups list", () => {
  test("returns usergroups array", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, usergroups: [{ id: "S001", name: "devs" }] }));
    const client = { usergroups: { list: mockList } } as any;
    const result = await executeUsergroupsList(client, {});
    expect(result).toHaveLength(1);
    expect(mockList).toHaveBeenCalledWith({});
  });

  test("passes optional filters", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, usergroups: [] }));
    const client = { usergroups: { list: mockList } } as any;
    await executeUsergroupsList(client, { includeCount: true, includeDisabled: true, includeUsers: true, teamId: "T001" });
    expect(mockList).toHaveBeenCalledWith({
      include_count: true, include_disabled: true, include_users: true, team_id: "T001",
    });
  });
});
