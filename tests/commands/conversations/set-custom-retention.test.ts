import { describe, expect, test, mock } from "bun:test";
import { executeConversationsSetCustomRetention } from "../../../src/commands/conversations/set-custom-retention";

describe("conversations set-custom-retention", () => {
  test("calls admin.conversations.setCustomRetention with correct args", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { setCustomRetention: mockSet } } } as any;
    await executeConversationsSetCustomRetention(client, { channelId: "C123", durationDays: 90 });
    expect(mockSet).toHaveBeenCalledWith({ channel_id: "C123", duration_days: 90 });
  });
});
