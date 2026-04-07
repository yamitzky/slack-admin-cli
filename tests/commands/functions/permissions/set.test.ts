import { describe, expect, test, mock } from "bun:test";
import { executeFunctionsPermissionsSet } from "../../../../src/commands/functions/permissions/set";

describe("functions permissions set", () => {
  test("calls admin.functions.permissions.set with all params", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;

    await executeFunctionsPermissionsSet(client, {
      functionId: "Fn1",
      visibility: "named_entities",
      userIds: ["U1", "U2"],
    });

    expect(mockApiCall).toHaveBeenCalledWith("admin.functions.permissions.set", {
      function_id: "Fn1",
      visibility: "named_entities",
      user_ids: ["U1", "U2"],
    });
  });

  test("calls without user_ids", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;

    await executeFunctionsPermissionsSet(client, {
      functionId: "Fn1",
      visibility: "everyone",
    });

    expect(mockApiCall).toHaveBeenCalledWith("admin.functions.permissions.set", {
      function_id: "Fn1",
      visibility: "everyone",
    });
  });
});
