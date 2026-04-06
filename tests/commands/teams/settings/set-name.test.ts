import { describe, expect, test, mock } from "bun:test";
import { executeSetName } from "../../../../src/commands/teams/settings/set-name";

describe("teams settings set-name", () => {
  test("calls setName with team_id and name", async () => {
    const mockSetName = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { teams: { settings: { setName: mockSetName } } },
    } as any;

    await executeSetName(client, { teamId: "T001", name: "New Name" });
    expect(mockSetName).toHaveBeenCalledWith({
      team_id: "T001",
      name: "New Name",
    });
  });
});
