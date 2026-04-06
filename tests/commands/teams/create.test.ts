import { describe, expect, test, mock } from "bun:test";
import { executeTeamsCreate } from "../../../src/commands/teams/create";

describe("teams create", () => {
  test("calls admin.teams.create with correct args", async () => {
    const mockCreate = mock(() =>
      Promise.resolve({ ok: true, team: "T123" }),
    );
    const client = {
      admin: { teams: { create: mockCreate } },
    } as any;

    const result = await executeTeamsCreate(client, {
      teamDomain: "my-workspace",
      teamName: "My Workspace",
      teamDescription: "A test workspace",
      teamDiscoverability: "closed",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      team_domain: "my-workspace",
      team_name: "My Workspace",
      team_description: "A test workspace",
      team_discoverability: "closed",
    });
    expect(result.ok).toBe(true);
  });

  test("calls without optional params", async () => {
    const mockCreate = mock(() =>
      Promise.resolve({ ok: true, team: "T123" }),
    );
    const client = {
      admin: { teams: { create: mockCreate } },
    } as any;

    await executeTeamsCreate(client, {
      teamDomain: "ws",
      teamName: "WS",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      team_domain: "ws",
      team_name: "WS",
    });
  });
});
