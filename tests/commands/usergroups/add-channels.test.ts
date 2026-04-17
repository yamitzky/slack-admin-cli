import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsAddChannels } from "../../../src/commands/usergroups/add-channels";

describe("usergroups add-channels", () => {
  test("calls admin.usergroups.addChannels with snake_case params", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { usergroups: { addChannels: mockFn } } } as any;
    await executeUsergroupsAddChannels(client, {
      usergroupId: "S001",
      channelIds: ["C001", "C002"],
      teamId: "T001",
    });
    expect(mockFn).toHaveBeenCalledWith({
      usergroup_id: "S001",
      channel_ids: ["C001", "C002"],
      team_id: "T001",
    });
  });

  test("omits team_id when undefined", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { usergroups: { addChannels: mockFn } } } as any;
    await executeUsergroupsAddChannels(client, {
      usergroupId: "S001",
      channelIds: ["C001"],
    });
    expect(mockFn).toHaveBeenCalledWith({
      usergroup_id: "S001",
      channel_ids: ["C001"],
      team_id: undefined,
    });
  });
});
