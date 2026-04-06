import { describe, expect, test, mock } from "bun:test";
import { executeSettingsInfo } from "../../../../src/commands/teams/settings/info";

describe("teams settings info", () => {
  test("calls admin.teams.settings.info with team_id", async () => {
    const mockInfo = mock(() =>
      Promise.resolve({
        ok: true,
        team: { id: "T001", name: "ws-1", domain: "ws1" },
      }),
    );
    const client = {
      admin: { teams: { settings: { info: mockInfo } } },
    } as any;

    const result = await executeSettingsInfo(client, { teamId: "T001" });
    expect(mockInfo).toHaveBeenCalledWith({ team_id: "T001" });
    expect(result.id).toBe("T001");
  });
});
