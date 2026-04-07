import { describe, expect, test, mock } from "bun:test";
import { executeAppsApprove } from "../../../src/commands/apps/approve";

describe("apps approve", () => {
  test("calls admin.apps.approve with app_id and team_id", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;
    await executeAppsApprove(client, { appId: "A123", teamId: "T456" });
    expect(mockApiCall).toHaveBeenCalledWith("admin.apps.approve", { app_id: "A123", team_id: "T456" });
  });

  test("calls with request_id and enterprise_id", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;
    await executeAppsApprove(client, { requestId: "R789", enterpriseId: "E012" });
    expect(mockApiCall).toHaveBeenCalledWith("admin.apps.approve", { request_id: "R789", enterprise_id: "E012" });
  });
});
