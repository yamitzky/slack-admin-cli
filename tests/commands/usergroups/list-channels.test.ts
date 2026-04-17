import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsListChannels } from "../../../src/commands/usergroups/list-channels";

describe("usergroups list-channels", () => {
  test("returns channels array", async () => {
    const mockFn = mock(() =>
      Promise.resolve({ ok: true, channels: [{ id: "C001", name: "general", num_members: 5 }] }),
    );
    const client = { admin: { usergroups: { listChannels: mockFn } } } as any;
    const result = await executeUsergroupsListChannels(client, {
      usergroupId: "S001",
      teamId: "T001",
      includeNumMembers: true,
    });
    expect(mockFn).toHaveBeenCalledWith({
      usergroup_id: "S001",
      team_id: "T001",
      include_num_members: true,
    });
    expect(result).toEqual([{ id: "C001", name: "general", num_members: 5 }]);
  });

  test("returns empty array when channels missing", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { usergroups: { listChannels: mockFn } } } as any;
    const result = await executeUsergroupsListChannels(client, { usergroupId: "S001" });
    expect(result).toEqual([]);
  });
});
