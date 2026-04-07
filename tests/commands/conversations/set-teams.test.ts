import { describe, expect, test, mock } from "bun:test";
import { executeConversationsSetTeams } from "../../../src/commands/conversations/set-teams";

describe("conversations set-teams", () => {
  test("executes when no workspaces would be disconnected", async () => {
    const mockGetTeams = mock(() => Promise.resolve({ ok: true, team_ids: ["T1", "T2"] }));
    const mockSetTeams = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { getTeams: mockGetTeams, setTeams: mockSetTeams } },
    } as any;

    await executeConversationsSetTeams(client, {
      channelId: "C123",
      targetTeamIds: ["T1", "T2", "T3"],
      allowDisconnect: false,
    });

    expect(mockSetTeams).toHaveBeenCalledWith({
      channel_id: "C123",
      target_team_ids: ["T1", "T2", "T3"],
    });
  });

  test("throws when workspaces would be disconnected and allowDisconnect is false", async () => {
    const mockGetTeams = mock(() => Promise.resolve({ ok: true, team_ids: ["T1", "T2", "T3"] }));
    const mockSetTeams = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { getTeams: mockGetTeams, setTeams: mockSetTeams } },
    } as any;

    await expect(
      executeConversationsSetTeams(client, {
        channelId: "C123",
        targetTeamIds: ["T1"],
        allowDisconnect: false,
      }),
    ).rejects.toThrow("T2, T3");

    expect(mockSetTeams).not.toHaveBeenCalled();
  });

  test("executes when allowDisconnect is true even with disconnections", async () => {
    const mockGetTeams = mock(() => Promise.resolve({ ok: true, team_ids: ["T1", "T2", "T3"] }));
    const mockSetTeams = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { getTeams: mockGetTeams, setTeams: mockSetTeams } },
    } as any;

    await executeConversationsSetTeams(client, {
      channelId: "C123",
      targetTeamIds: ["T1"],
      allowDisconnect: true,
    });

    expect(mockSetTeams).toHaveBeenCalledWith({
      channel_id: "C123",
      target_team_ids: ["T1"],
    });
  });

  test("skips disconnect check when org_channel is true", async () => {
    const mockGetTeams = mock(() => Promise.resolve({ ok: true, team_ids: ["T1", "T2"] }));
    const mockSetTeams = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { getTeams: mockGetTeams, setTeams: mockSetTeams } },
    } as any;

    await executeConversationsSetTeams(client, {
      channelId: "C123",
      orgChannel: true,
      allowDisconnect: false,
    });

    expect(mockGetTeams).not.toHaveBeenCalled();
    expect(mockSetTeams).toHaveBeenCalledWith({
      channel_id: "C123",
      org_channel: true,
    });
  });

  test("passes optional team_id", async () => {
    const mockGetTeams = mock(() => Promise.resolve({ ok: true, team_ids: ["T1"] }));
    const mockSetTeams = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { getTeams: mockGetTeams, setTeams: mockSetTeams } },
    } as any;

    await executeConversationsSetTeams(client, {
      channelId: "C123",
      targetTeamIds: ["T1", "T2"],
      teamId: "T1",
      allowDisconnect: false,
    });

    expect(mockSetTeams).toHaveBeenCalledWith({
      channel_id: "C123",
      target_team_ids: ["T1", "T2"],
      team_id: "T1",
    });
  });
});
