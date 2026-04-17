import { describe, expect, test, mock } from "bun:test";
import { executeEmojiAddAlias } from "../../../src/commands/emoji/add-alias";

describe("emoji add-alias", () => {
  test("calls admin.emoji.addAlias", async () => {
    const mockAddAlias = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { emoji: { addAlias: mockAddAlias } } } as any;
    await executeEmojiAddAlias(client, { name: "party_tada", aliasFor: "tada" });
    expect(mockAddAlias).toHaveBeenCalledWith({ name: "party_tada", alias_for: "tada" });
  });
});
