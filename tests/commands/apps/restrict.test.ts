import { describe, expect, test, mock } from "bun:test";
import { executeAppsRestrict } from "../../../src/commands/apps/restrict";

describe("apps restrict", () => {
  test("calls admin.apps.restrict with correct params", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;
    await executeAppsRestrict(client, { appId: "A123", teamId: "T456" });
    expect(mockApiCall).toHaveBeenCalledWith("admin.apps.restrict", { app_id: "A123", team_id: "T456" });
  });
});
