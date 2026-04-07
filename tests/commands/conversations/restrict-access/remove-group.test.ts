import { describe, expect, test, mock } from "bun:test";
import { executeRestrictAccessRemoveGroup } from "../../../../src/commands/conversations/restrict-access/remove-group";

describe("conversations restrict-access remove-group", () => {
  test("calls with all args", async () => {
    const mockRemoveGroup = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { restrictAccess: { removeGroup: mockRemoveGroup } } },
    } as any;
    await executeRestrictAccessRemoveGroup(client, { channelId: "C123", groupId: "G456", teamId: "T789" });
    expect(mockRemoveGroup).toHaveBeenCalledWith({ channel_id: "C123", group_id: "G456", team_id: "T789" });
  });

  test("calls without optional team_id", async () => {
    const mockRemoveGroup = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { restrictAccess: { removeGroup: mockRemoveGroup } } },
    } as any;
    await executeRestrictAccessRemoveGroup(client, { channelId: "C123", groupId: "G456" });
    expect(mockRemoveGroup).toHaveBeenCalledWith({ channel_id: "C123", group_id: "G456" });
  });
});
