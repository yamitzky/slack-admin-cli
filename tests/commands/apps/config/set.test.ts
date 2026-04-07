import { describe, expect, test, mock } from "bun:test";
import { executeAppsConfigSet } from "../../../../src/commands/apps/config/set";

describe("apps config set", () => {
  test("calls admin.apps.config.set with all params", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;

    await executeAppsConfigSet(client, {
      appId: "A1",
      domainRestrictions: { urls: ["https://example.com"] },
      workflowAuthStrategy: "end_user_only",
    });

    expect(mockApiCall).toHaveBeenCalledWith("admin.apps.config.set", {
      app_id: "A1",
      domain_restrictions: { urls: ["https://example.com"] },
      workflow_auth_strategy: "end_user_only",
    });
  });

  test("calls with only app_id", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;

    await executeAppsConfigSet(client, { appId: "A1" });

    expect(mockApiCall).toHaveBeenCalledWith("admin.apps.config.set", { app_id: "A1" });
  });
});
