import { describe, expect, test, mock } from "bun:test";
import { executeRestrictAccessListGroups } from "../../../../src/commands/conversations/restrict-access/list-groups";

describe("conversations restrict-access list-groups", () => {
  test("calls with correct args", async () => {
    const mockListGroups = mock(() => Promise.resolve({ ok: true, group_ids: ["G1", "G2"] }));
    const client = {
      admin: { conversations: { restrictAccess: { listGroups: mockListGroups } } },
    } as any;
    await executeRestrictAccessListGroups(client, { channelId: "C123", teamId: "T789" });
    expect(mockListGroups).toHaveBeenCalledWith({ channel_id: "C123", team_id: "T789" });
  });

  test("calls without optional team_id", async () => {
    const mockListGroups = mock(() => Promise.resolve({ ok: true, group_ids: [] }));
    const client = {
      admin: { conversations: { restrictAccess: { listGroups: mockListGroups } } },
    } as any;
    await executeRestrictAccessListGroups(client, { channelId: "C123" });
    expect(mockListGroups).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
