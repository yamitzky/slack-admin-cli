import { describe, expect, test, mock } from "bun:test";
import { executeConversationsDisconnectShared } from "../../../src/commands/conversations/disconnect-shared";

describe("conversations disconnect-shared", () => {
  test("calls admin.conversations.disconnectShared with correct args", async () => {
    const mockDisconnect = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { disconnectShared: mockDisconnect } } } as any;
    await executeConversationsDisconnectShared(client, { channelId: "C123", leavingTeamIds: ["T1", "T2"] });
    expect(mockDisconnect).toHaveBeenCalledWith({ channel_id: "C123", leaving_team_ids: ["T1", "T2"] });
  });

  test("calls without optional leaving_team_ids", async () => {
    const mockDisconnect = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { disconnectShared: mockDisconnect } } } as any;
    await executeConversationsDisconnectShared(client, { channelId: "C123" });
    expect(mockDisconnect).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
