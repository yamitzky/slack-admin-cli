import { describe, expect, test, mock } from "bun:test";
import { executeConversationsInvite } from "../../../src/commands/conversations/invite";

describe("conversations invite", () => {
  test("calls admin.conversations.invite with correct args", async () => {
    const mockInvite = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { invite: mockInvite } } } as any;
    await executeConversationsInvite(client, { channelId: "C123", userIds: ["U1", "U2"] });
    expect(mockInvite).toHaveBeenCalledWith({ channel_id: "C123", user_ids: ["U1", "U2"] });
  });
});
