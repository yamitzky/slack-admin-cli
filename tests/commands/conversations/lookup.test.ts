import { describe, expect, test, mock } from "bun:test";
import { executeConversationsLookup } from "../../../src/commands/conversations/lookup";

describe("conversations lookup", () => {
  test("calls admin.conversations.lookup with correct args", async () => {
    const mockLookup = mock(() =>
      Promise.resolve({ ok: true, channels: [{ id: "C1" }] }),
    );
    const client = { admin: { conversations: { lookup: mockLookup } } } as any;

    const result = await executeConversationsLookup(client, {
      teamIds: ["T1"],
      lastMessageActivityBefore: 1700000000,
      maxMemberCount: 5,
      cursor: "xyz",
      limit: 20,
    });

    expect(mockLookup).toHaveBeenCalledWith({
      team_ids: ["T1"],
      last_message_activity_before: 1700000000,
      max_member_count: 5,
      cursor: "xyz",
      limit: 20,
    });
  });

  test("calls without optional params", async () => {
    const mockLookup = mock(() =>
      Promise.resolve({ ok: true, channels: [] }),
    );
    const client = { admin: { conversations: { lookup: mockLookup } } } as any;

    await executeConversationsLookup(client, {
      teamIds: ["T1"],
      lastMessageActivityBefore: 1700000000,
    });

    expect(mockLookup).toHaveBeenCalledWith({
      team_ids: ["T1"],
      last_message_activity_before: 1700000000,
    });
  });
});
