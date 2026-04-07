import { describe, expect, test, mock } from "bun:test";
import { executeConversationsBulkArchive } from "../../../src/commands/conversations/bulk-archive";

describe("conversations bulk-archive", () => {
  test("calls admin.conversations.bulkArchive with correct args", async () => {
    const mockBulkArchive = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { bulkArchive: mockBulkArchive } } } as any;
    await executeConversationsBulkArchive(client, { channelIds: ["C1", "C2", "C3"] });
    expect(mockBulkArchive).toHaveBeenCalledWith({ channel_ids: ["C1", "C2", "C3"] });
  });
});
