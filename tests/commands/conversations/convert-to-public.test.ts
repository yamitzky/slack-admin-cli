import { describe, expect, test, mock } from "bun:test";
import { executeConversationsConvertToPublic } from "../../../src/commands/conversations/convert-to-public";

describe("conversations convert-to-public", () => {
  test("calls admin.conversations.convertToPublic with correct args", async () => {
    const mockConvertToPublic = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { convertToPublic: mockConvertToPublic } } } as any;

    await executeConversationsConvertToPublic(client, { channelId: "C123" });

    expect(mockConvertToPublic).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
