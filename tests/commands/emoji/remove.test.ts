import { describe, expect, test, mock } from "bun:test";
import { executeEmojiRemove } from "../../../src/commands/emoji/remove";

describe("emoji remove", () => {
  test("calls admin.emoji.remove", async () => {
    const mockRemove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { emoji: { remove: mockRemove } } } as any;
    await executeEmojiRemove(client, { name: "party" });
    expect(mockRemove).toHaveBeenCalledWith({ name: "party" });
  });
});
