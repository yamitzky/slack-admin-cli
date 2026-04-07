import { describe, expect, test, mock } from "bun:test";
import { executeAppsClearResolution } from "../../../src/commands/apps/clear-resolution";

describe("apps clear-resolution", () => {
  test("calls admin.apps.clearResolution with correct params", async () => {
    const mockClearResolution = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { apps: { clearResolution: mockClearResolution } } } as any;
    await executeAppsClearResolution(client, { appId: "A123", teamId: "T456" });
    expect(mockClearResolution).toHaveBeenCalledWith({ app_id: "A123", team_id: "T456" });
  });
});
