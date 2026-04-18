import { describe, expect, test, mock } from "bun:test";
import { executeTeamsIntegrationLogs } from "../../../src/commands/teams/integration-logs";

describe("teams integration-logs", () => {
  test("returns logs array", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, logs: [{ change_type: "added" }] }));
    const client = { team: { integrationLogs: mockCall } } as any;
    const result = await executeTeamsIntegrationLogs(client, {});
    expect(result).toHaveLength(1);
    expect(mockCall).toHaveBeenCalledWith({});
  });

  test("passes optional filters", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, logs: [] }));
    const client = { team: { integrationLogs: mockCall } } as any;
    await executeTeamsIntegrationLogs(client, {
      appId: "A001", changeType: "added", count: 50, page: 1,
      serviceId: "SVC001", teamId: "T001", user: "U001",
    });
    expect(mockCall).toHaveBeenCalledWith({
      app_id: "A001", change_type: "added", count: 50, page: 1,
      service_id: "SVC001", team_id: "T001", user: "U001",
    });
  });
});
