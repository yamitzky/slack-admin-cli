import { describe, expect, test, mock } from "bun:test";
import { executeSetDiscoverability } from "../../../../src/commands/teams/settings/set-discoverability";

describe("teams settings set-discoverability", () => {
  test("calls setDiscoverability with team_id and discoverability", async () => {
    const mockSetDisc = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { teams: { settings: { setDiscoverability: mockSetDisc } } },
    } as any;

    await executeSetDiscoverability(client, {
      teamId: "T001",
      discoverability: "invite_only",
    });
    expect(mockSetDisc).toHaveBeenCalledWith({
      team_id: "T001",
      discoverability: "invite_only",
    });
  });
});
