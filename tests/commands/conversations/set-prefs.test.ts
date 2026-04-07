import { describe, expect, test, mock } from "bun:test";
import { executeConversationsSetPrefs } from "../../../src/commands/conversations/set-prefs";

describe("conversations set-prefs", () => {
  test("calls admin.conversations.setConversationPrefs with correct args", async () => {
    const mockSetPrefs = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { setConversationPrefs: mockSetPrefs } } } as any;
    const prefs = { who_can_post: { type: ["owner"] } };
    await executeConversationsSetPrefs(client, { channelId: "C123", prefs });
    expect(mockSetPrefs).toHaveBeenCalledWith({ channel_id: "C123", prefs });
  });
});
