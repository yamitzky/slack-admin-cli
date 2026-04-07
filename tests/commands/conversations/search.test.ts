import { describe, expect, test, mock } from "bun:test";
import { executeConversationsSearch } from "../../../src/commands/conversations/search";

describe("conversations search", () => {
  test("calls admin.conversations.search with all params", async () => {
    const mockSearch = mock(() =>
      Promise.resolve({ ok: true, conversations: [{ id: "C1", name: "general" }] }),
    );
    const client = { admin: { conversations: { search: mockSearch } } } as any;

    const result = await executeConversationsSearch(client, {
      query: "general",
      teamIds: ["T1"],
      sort: "name",
      sortDir: "asc",
      cursor: "abc",
      limit: 10,
    });

    expect(mockSearch).toHaveBeenCalledWith({
      query: "general",
      team_ids: ["T1"],
      sort: "name",
      sort_dir: "asc",
      cursor: "abc",
      limit: 10,
    });
    expect(result).toHaveLength(1);
  });

  test("calls with no params", async () => {
    const mockSearch = mock(() =>
      Promise.resolve({ ok: true, conversations: [] }),
    );
    const client = { admin: { conversations: { search: mockSearch } } } as any;

    const result = await executeConversationsSearch(client, {});

    expect(mockSearch).toHaveBeenCalledWith({});
    expect(result).toHaveLength(0);
  });
});
