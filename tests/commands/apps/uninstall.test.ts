import { describe, expect, test, mock } from "bun:test";
import { executeAppsUninstall } from "../../../src/commands/apps/uninstall";

describe("apps uninstall", () => {
  test("calls admin.apps.uninstall with correct params", async () => {
    const mockUninstall = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { apps: { uninstall: mockUninstall } } } as any;
    await executeAppsUninstall(client, { appId: "A123", enterpriseId: "E789" });
    expect(mockUninstall).toHaveBeenCalledWith({ app_id: "A123", enterprise_id: "E789" });
  });
});
