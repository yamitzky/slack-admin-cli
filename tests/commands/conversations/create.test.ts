import { describe, expect, test, mock } from "bun:test";
import { executeConversationsCreate } from "../../../src/commands/conversations/create";

describe("conversations create", () => {
  test("creates channel in specific workspace", async () => {
    const mockCreate = mock(() => Promise.resolve({ ok: true, channel_id: "C999" }));
    const client = { admin: { conversations: { create: mockCreate } } } as any;
    const result = await executeConversationsCreate(client, {
      name: "new-channel",
      isPrivate: false,
      teamId: "T123",
    });
    expect(mockCreate).toHaveBeenCalledWith({
      name: "new-channel",
      is_private: false,
      team_id: "T123",
    });
    expect(result.ok).toBe(true);
  });

  test("creates org-wide channel", async () => {
    const mockCreate = mock(() => Promise.resolve({ ok: true, channel_id: "C999" }));
    const client = { admin: { conversations: { create: mockCreate } } } as any;
    await executeConversationsCreate(client, {
      name: "org-channel",
      isPrivate: true,
      orgWide: true,
    });
    expect(mockCreate).toHaveBeenCalledWith({
      name: "org-channel",
      is_private: true,
      org_wide: true,
    });
  });

  test("passes optional description", async () => {
    const mockCreate = mock(() => Promise.resolve({ ok: true, channel_id: "C999" }));
    const client = { admin: { conversations: { create: mockCreate } } } as any;
    await executeConversationsCreate(client, {
      name: "ch",
      isPrivate: false,
      teamId: "T1",
      description: "A channel",
    });
    expect(mockCreate).toHaveBeenCalledWith({
      name: "ch",
      is_private: false,
      team_id: "T1",
      description: "A channel",
    });
  });
});
