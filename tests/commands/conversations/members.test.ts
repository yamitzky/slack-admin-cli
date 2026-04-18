import { describe, expect, test, mock } from "bun:test";
import { executeConversationsMembers } from "../../../src/commands/conversations/members";

describe("conversations members", () => {
  test("returns members array", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, members: ["U001", "U002"] }));
    const client = { conversations: { members: mockCall } } as any;
    const result = await executeConversationsMembers(client, { channel: "C001" });
    expect(result).toEqual(["U001", "U002"]);
    expect(mockCall).toHaveBeenCalledWith({ channel: "C001" });
  });

  test("passes cursor and limit", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, members: [] }));
    const client = { conversations: { members: mockCall } } as any;
    await executeConversationsMembers(client, { channel: "C001", cursor: "c1", limit: 50 });
    expect(mockCall).toHaveBeenCalledWith({ channel: "C001", cursor: "c1", limit: 50 });
  });
});
