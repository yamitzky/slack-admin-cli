import { describe, expect, test, mock } from "bun:test";
import { executeEmojiRename } from "../../../src/commands/emoji/rename";

describe("emoji rename", () => {
  test("calls admin.emoji.rename", async () => {
    const mockRename = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { emoji: { rename: mockRename } } } as any;
    await executeEmojiRename(client, { name: "party", newName: "party2" });
    expect(mockRename).toHaveBeenCalledWith({ name: "party", new_name: "party2" });
  });
});
