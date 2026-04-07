import { describe, expect, test, mock } from "bun:test";
import { executeRestrictAccessAddGroup } from "../../../../src/commands/conversations/restrict-access/add-group";

describe("conversations restrict-access add-group", () => {
  test("calls with all args", async () => {
    const mockAddGroup = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { restrictAccess: { addGroup: mockAddGroup } } },
    } as any;
    await executeRestrictAccessAddGroup(client, { channelId: "C123", groupId: "G456", teamId: "T789" });
    expect(mockAddGroup).toHaveBeenCalledWith({ channel_id: "C123", group_id: "G456", team_id: "T789" });
  });

  test("calls without optional team_id", async () => {
    const mockAddGroup = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { restrictAccess: { addGroup: mockAddGroup } } },
    } as any;
    await executeRestrictAccessAddGroup(client, { channelId: "C123", groupId: "G456" });
    expect(mockAddGroup).toHaveBeenCalledWith({ channel_id: "C123", group_id: "G456" });
  });
});
