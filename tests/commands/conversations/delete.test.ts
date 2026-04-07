import { describe, expect, test, mock } from "bun:test";
import { executeConversationsDelete } from "../../../src/commands/conversations/delete";

describe("conversations delete", () => {
  test("calls admin.conversations.delete with correct args", async () => {
    const mockDelete = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { delete: mockDelete } } } as any;

    await executeConversationsDelete(client, { channelId: "C123" });

    expect(mockDelete).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
