import { describe, expect, test, mock } from "bun:test";
import { executeAppsRequestsCancel } from "../../../../src/commands/apps/requests/cancel";

describe("apps requests cancel", () => {
  test("calls admin.apps.requests.cancel with correct params", async () => {
    const mockCancel = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { apps: { requests: { cancel: mockCancel } } } } as any;

    await executeAppsRequestsCancel(client, { requestId: "R1", teamId: "T1" });

    expect(mockCancel).toHaveBeenCalledWith({ request_id: "R1", team_id: "T1" });
  });
});
