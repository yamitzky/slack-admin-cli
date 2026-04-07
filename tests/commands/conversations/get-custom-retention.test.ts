import { describe, expect, test, mock } from "bun:test";
import { executeConversationsGetCustomRetention } from "../../../src/commands/conversations/get-custom-retention";

describe("conversations get-custom-retention", () => {
  test("calls admin.conversations.getCustomRetention with correct args", async () => {
    const mockGet = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { getCustomRetention: mockGet } } } as any;
    const result = await executeConversationsGetCustomRetention(client, { channelId: "C123" });
    expect(mockGet).toHaveBeenCalledWith({ channel_id: "C123" });
    expect(result.ok).toBe(true);
  });
});
