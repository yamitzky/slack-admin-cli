import { describe, expect, test, mock } from "bun:test";
import { executeTeamsList } from "../../../src/commands/teams/list";

describe("teams list", () => {
  test("returns teams from API", async () => {
    const mockList = mock(() =>
      Promise.resolve({
        ok: true,
        teams: [
          { id: "T001", name: "ws-1", domain: "ws1" },
          { id: "T002", name: "ws-2", domain: "ws2" },
        ],
      }),
    );
    const client = {
      admin: { teams: { list: mockList } },
    } as any;

    const result = await executeTeamsList(client, {});
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("T001");
  });

  test("passes cursor for pagination", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, teams: [] }),
    );
    const client = {
      admin: { teams: { list: mockList } },
    } as any;

    await executeTeamsList(client, { cursor: "abc123", limit: 50 });
    expect(mockList).toHaveBeenCalledWith({
      cursor: "abc123",
      limit: 50,
    });
  });
});
