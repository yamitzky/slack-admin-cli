import { describe, expect, test, mock } from "bun:test";
import { executeEmojiList } from "../../../src/commands/emoji/list";

describe("emoji list", () => {
  test("converts emoji map into rows", async () => {
    const mockList = mock(() =>
      Promise.resolve({
        ok: true,
        emoji: {
          tada: { url: "https://x" },
          smile: { url: "https://y" },
        },
      }),
    );
    const client = { admin: { emoji: { list: mockList } } } as any;
    const result = await executeEmojiList(client, {});
    expect(mockList).toHaveBeenCalledWith({ cursor: undefined, limit: undefined });
    expect(result).toEqual([
      { name: "tada", url: "https://x" },
      { name: "smile", url: "https://y" },
    ]);
  });

  test("passes cursor and limit", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, emoji: {} }));
    const client = { admin: { emoji: { list: mockList } } } as any;
    await executeEmojiList(client, { cursor: "c", limit: 10 });
    expect(mockList).toHaveBeenCalledWith({ cursor: "c", limit: 10 });
  });
});
