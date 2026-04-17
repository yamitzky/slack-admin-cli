import { describe, expect, test, mock } from "bun:test";
import { executeEmojiAdd } from "../../../src/commands/emoji/add";

describe("emoji add", () => {
  test("calls admin.emoji.add", async () => {
    const mockAdd = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { emoji: { add: mockAdd } } } as any;
    await executeEmojiAdd(client, { name: "party", url: "https://x" });
    expect(mockAdd).toHaveBeenCalledWith({ name: "party", url: "https://x" });
  });
});
