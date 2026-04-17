import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsRemoveChannels } from "../../../src/commands/usergroups/remove-channels";

describe("usergroups remove-channels", () => {
  test("calls admin.usergroups.removeChannels with snake_case params", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { usergroups: { removeChannels: mockFn } } } as any;
    await executeUsergroupsRemoveChannels(client, {
      usergroupId: "S001",
      channelIds: ["C001", "C002"],
    });
    expect(mockFn).toHaveBeenCalledWith({
      usergroup_id: "S001",
      channel_ids: ["C001", "C002"],
    });
  });
});
