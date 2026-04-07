import { describe, expect, test, mock } from "bun:test";
import { executeConversationsRename } from "../../../src/commands/conversations/rename";

describe("conversations rename", () => {
  test("calls admin.conversations.rename with correct args", async () => {
    const mockRename = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { rename: mockRename } } } as any;
    await executeConversationsRename(client, { channelId: "C123", name: "new-name" });
    expect(mockRename).toHaveBeenCalledWith({ channel_id: "C123", name: "new-name" });
  });
});
