import { describe, expect, test, mock } from "bun:test";
import { executeConversationsConvertToPrivate } from "../../../src/commands/conversations/convert-to-private";

describe("conversations convert-to-private", () => {
  test("calls admin.conversations.convertToPrivate with correct args", async () => {
    const mockConvert = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { convertToPrivate: mockConvert } } } as any;
    await executeConversationsConvertToPrivate(client, { channelId: "C123" });
    expect(mockConvert).toHaveBeenCalledWith({ channel_id: "C123" });
  });

  test("passes optional name for MPIM conversion", async () => {
    const mockConvert = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { convertToPrivate: mockConvert } } } as any;
    await executeConversationsConvertToPrivate(client, { channelId: "C123", name: "private-ch" });
    expect(mockConvert).toHaveBeenCalledWith({ channel_id: "C123", name: "private-ch" });
  });
});
