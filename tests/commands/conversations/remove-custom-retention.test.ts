import { describe, expect, test, mock } from "bun:test";
import { executeConversationsRemoveCustomRetention } from "../../../src/commands/conversations/remove-custom-retention";

describe("conversations remove-custom-retention", () => {
  test("calls admin.conversations.removeCustomRetention with correct args", async () => {
    const mockRemove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { removeCustomRetention: mockRemove } } } as any;
    await executeConversationsRemoveCustomRetention(client, { channelId: "C123" });
    expect(mockRemove).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
