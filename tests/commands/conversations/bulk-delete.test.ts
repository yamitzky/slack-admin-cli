import { describe, expect, test, mock } from "bun:test";
import { executeConversationsBulkDelete } from "../../../src/commands/conversations/bulk-delete";

describe("conversations bulk-delete", () => {
  test("calls admin.conversations.bulkDelete with correct args", async () => {
    const mockBulkDelete = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { bulkDelete: mockBulkDelete } } } as any;
    await executeConversationsBulkDelete(client, { channelIds: ["C1", "C2"] });
    expect(mockBulkDelete).toHaveBeenCalledWith({ channel_ids: ["C1", "C2"] });
  });
});
