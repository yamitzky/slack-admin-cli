import { describe, expect, test, mock } from "bun:test";
import { executeConversationsArchive } from "../../../src/commands/conversations/archive";

describe("conversations archive", () => {
  test("calls admin.conversations.archive with correct args", async () => {
    const mockArchive = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { archive: mockArchive } } } as any;

    await executeConversationsArchive(client, { channelId: "C123" });

    expect(mockArchive).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
