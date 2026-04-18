import { describe, expect, test, mock } from "bun:test";
import { executeTeamsAccessLogs } from "../../../src/commands/teams/access-logs";

describe("teams access-logs", () => {
  test("returns logins array", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, logins: [{ user_id: "U001", ip: "1.2.3.4" }] }));
    const client = { team: { accessLogs: mockCall } } as any;
    const result = await executeTeamsAccessLogs(client, {});
    expect(result).toHaveLength(1);
    expect(mockCall).toHaveBeenCalledWith({});
  });

  test("passes before/count/page/team_id", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, logins: [] }));
    const client = { team: { accessLogs: mockCall } } as any;
    await executeTeamsAccessLogs(client, { before: 1234567890, count: 100, page: 2, teamId: "T001" });
    expect(mockCall).toHaveBeenCalledWith({ before: 1234567890, count: 100, page: 2, team_id: "T001" });
  });
});
