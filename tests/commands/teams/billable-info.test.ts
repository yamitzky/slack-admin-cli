import { describe, expect, test, mock } from "bun:test";
import { executeTeamsBillableInfo } from "../../../src/commands/teams/billable-info";

describe("teams billable-info", () => {
  test("returns billable_info map", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, billable_info: { U001: { billing_active: true } } }));
    const client = { team: { billableInfo: mockCall } } as any;
    const result = await executeTeamsBillableInfo(client, {});
    expect(result.U001?.billing_active).toBe(true);
    expect(mockCall).toHaveBeenCalledWith({});
  });

  test("passes user and team_id", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, billable_info: {} }));
    const client = { team: { billableInfo: mockCall } } as any;
    await executeTeamsBillableInfo(client, { user: "U001", teamId: "T001", cursor: "c1", limit: 50 });
    expect(mockCall).toHaveBeenCalledWith({ user: "U001", team_id: "T001", cursor: "c1", limit: 50 });
  });
});
