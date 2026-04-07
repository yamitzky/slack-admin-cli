import { describe, expect, test, mock } from "bun:test";
import { executeAppsRequestsCancel } from "../../../../src/commands/apps/requests/cancel";

describe("apps requests cancel", () => {
  test("calls admin.apps.requests.cancel with correct params", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;

    await executeAppsRequestsCancel(client, { requestId: "R1", teamId: "T1" });

    expect(mockApiCall).toHaveBeenCalledWith("admin.apps.requests.cancel", { request_id: "R1", team_id: "T1" });
  });
});
