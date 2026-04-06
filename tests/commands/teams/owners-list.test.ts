import { describe, expect, test, mock } from "bun:test";
import { executeTeamsOwnersList } from "../../../src/commands/teams/owners-list";

describe("teams owners list", () => {
  test("calls admin.teams.owners.list with team_id", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, owner_ids: ["U001"] }),
    );
    const client = {
      admin: { teams: { owners: { list: mockList } } },
    } as any;

    const result = await executeTeamsOwnersList(client, { teamId: "T001" });
    expect(mockList).toHaveBeenCalledWith({ team_id: "T001" });
    expect(result).toEqual(["U001"]);
  });
});
