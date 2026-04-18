import { describe, expect, test, mock } from "bun:test";
import { executeUsersConversations } from "../../../src/commands/users/conversations";

describe("users conversations", () => {
  test("returns channels array", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, channels: [{ id: "C001" }] }));
    const client = { users: { conversations: mockCall } } as any;
    const result = await executeUsersConversations(client, { user: "U001" });
    expect(result).toHaveLength(1);
    expect(mockCall).toHaveBeenCalledWith({ user: "U001" });
  });

  test("passes optional filters", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, channels: [] }));
    const client = { users: { conversations: mockCall } } as any;
    await executeUsersConversations(client, {
      user: "U001", cursor: "c1", limit: 50, types: "public_channel,private_channel", excludeArchived: true,
    });
    expect(mockCall).toHaveBeenCalledWith({
      user: "U001", cursor: "c1", limit: 50, types: "public_channel,private_channel", exclude_archived: true,
    });
  });
});
