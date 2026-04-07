import { describe, expect, test, mock } from "bun:test";
import { executeConversationsGetPrefs } from "../../../src/commands/conversations/get-prefs";

describe("conversations get-prefs", () => {
  test("calls admin.conversations.getConversationPrefs with correct args", async () => {
    const mockGetPrefs = mock(() => Promise.resolve({ ok: true, prefs: { who_can_post: {} } }));
    const client = { admin: { conversations: { getConversationPrefs: mockGetPrefs } } } as any;
    const result = await executeConversationsGetPrefs(client, { channelId: "C123" });
    expect(mockGetPrefs).toHaveBeenCalledWith({ channel_id: "C123" });
    expect(result).toEqual({ who_can_post: {} });
  });
});
