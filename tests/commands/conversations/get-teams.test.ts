import { describe, expect, test, mock } from "bun:test";
import { executeConversationsGetTeams } from "../../../src/commands/conversations/get-teams";

describe("conversations get-teams", () => {
  test("returns team IDs from API", async () => {
    const mockGetTeams = mock(() =>
      Promise.resolve({ ok: true, teams: ["T1", "T2", "T3"] }),
    );
    const client = { admin: { conversations: { getTeams: mockGetTeams } } } as any;

    const result = await executeConversationsGetTeams(client, { channelId: "C123" });

    expect(mockGetTeams).toHaveBeenCalledWith({ channel_id: "C123" });
    expect(result).toEqual(["T1", "T2", "T3"]);
  });

  test("passes pagination params", async () => {
    const mockGetTeams = mock(() =>
      Promise.resolve({ ok: true, teams: [] }),
    );
    const client = { admin: { conversations: { getTeams: mockGetTeams } } } as any;

    await executeConversationsGetTeams(client, { channelId: "C123", cursor: "abc", limit: 50 });

    expect(mockGetTeams).toHaveBeenCalledWith({ channel_id: "C123", cursor: "abc", limit: 50 });
  });
});
