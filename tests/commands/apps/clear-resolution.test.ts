import { describe, expect, test, mock } from "bun:test";
import { executeAppsClearResolution } from "../../../src/commands/apps/clear-resolution";

describe("apps clear-resolution", () => {
  test("calls admin.apps.clearResolution with correct params", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;
    await executeAppsClearResolution(client, { appId: "A123", teamId: "T456" });
    expect(mockApiCall).toHaveBeenCalledWith("admin.apps.clearResolution", { app_id: "A123", team_id: "T456" });
  });
});
