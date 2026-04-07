import { describe, expect, test, mock } from "bun:test";
import { executeConversationsUnarchive } from "../../../src/commands/conversations/unarchive";

describe("conversations unarchive", () => {
  test("calls admin.conversations.unarchive with correct args", async () => {
    const mockUnarchive = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { unarchive: mockUnarchive } } } as any;

    await executeConversationsUnarchive(client, { channelId: "C123" });

    expect(mockUnarchive).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
