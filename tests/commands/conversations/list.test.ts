import { describe, expect, test, mock } from "bun:test";
import { executeConversationsList } from "../../../src/commands/conversations/list";

describe("conversations list", () => {
  test("returns channels array", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, channels: [{ id: "C001", name: "general" }] }));
    const client = { conversations: { list: mockList } } as any;
    const result = await executeConversationsList(client, {});
    expect(result).toHaveLength(1);
    expect(mockList).toHaveBeenCalledWith({});
  });

  test("passes optional filters", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, channels: [] }));
    const client = { conversations: { list: mockList } } as any;
    await executeConversationsList(client, {
      cursor: "c1", limit: 100, types: "public_channel", excludeArchived: true, teamId: "T001",
    });
    expect(mockList).toHaveBeenCalledWith({
      cursor: "c1", limit: 100, types: "public_channel", exclude_archived: true, team_id: "T001",
    });
  });
});
