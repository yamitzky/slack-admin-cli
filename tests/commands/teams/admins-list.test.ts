import { describe, expect, test, mock } from "bun:test";
import { executeTeamsAdminsList } from "../../../src/commands/teams/admins-list";

describe("teams admins list", () => {
  test("calls admin.teams.admins.list with team_id", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, admin_ids: ["U001", "U002"] }),
    );
    const client = {
      admin: { teams: { admins: { list: mockList } } },
    } as any;

    const result = await executeTeamsAdminsList(client, { teamId: "T001" });
    expect(mockList).toHaveBeenCalledWith({ team_id: "T001" });
    expect(result).toEqual(["U001", "U002"]);
  });
});
