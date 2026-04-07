import { describe, expect, test, mock } from "bun:test";
import { executeConversationsBulkMove } from "../../../src/commands/conversations/bulk-move";

describe("conversations bulk-move", () => {
  test("calls admin.conversations.bulkMove with correct args", async () => {
    const mockBulkMove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { bulkMove: mockBulkMove } } } as any;
    await executeConversationsBulkMove(client, { channelIds: ["C1", "C2"], targetTeamId: "T999" });
    expect(mockBulkMove).toHaveBeenCalledWith({ channel_ids: ["C1", "C2"], target_team_id: "T999" });
  });
});
