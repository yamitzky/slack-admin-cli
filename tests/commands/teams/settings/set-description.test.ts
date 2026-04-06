import { describe, expect, test, mock } from "bun:test";
import { executeSetDescription } from "../../../../src/commands/teams/settings/set-description";

describe("teams settings set-description", () => {
  test("calls setDescription with team_id and description", async () => {
    const mockSetDesc = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { teams: { settings: { setDescription: mockSetDesc } } },
    } as any;

    await executeSetDescription(client, {
      teamId: "T001",
      description: "New description",
    });
    expect(mockSetDesc).toHaveBeenCalledWith({
      team_id: "T001",
      description: "New description",
    });
  });
});
