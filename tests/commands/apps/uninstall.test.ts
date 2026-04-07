import { describe, expect, test, mock } from "bun:test";
import { executeAppsUninstall } from "../../../src/commands/apps/uninstall";

describe("apps uninstall", () => {
  test("calls admin.apps.uninstall with correct params", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;
    await executeAppsUninstall(client, { appId: "A123", enterpriseId: "E789" });
    expect(mockApiCall).toHaveBeenCalledWith("admin.apps.uninstall", { app_id: "A123", enterprise_id: "E789" });
  });
});
