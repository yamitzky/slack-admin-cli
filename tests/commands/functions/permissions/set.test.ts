import { describe, expect, test, mock } from "bun:test";
import { executeFunctionsPermissionsSet } from "../../../../src/commands/functions/permissions/set";

describe("functions permissions set", () => {
  test("calls admin.functions.permissions.set with all params", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { functions: { permissions: { set: mockSet } } } } as any;

    await executeFunctionsPermissionsSet(client, {
      functionId: "Fn1",
      visibility: "named_entities",
      userIds: ["U1", "U2"],
    });

    expect(mockSet).toHaveBeenCalledWith({
      function_id: "Fn1",
      visibility: "named_entities",
      user_ids: ["U1", "U2"],
    });
  });

  test("calls without user_ids", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { functions: { permissions: { set: mockSet } } } } as any;

    await executeFunctionsPermissionsSet(client, {
      functionId: "Fn1",
      visibility: "everyone",
    });

    expect(mockSet).toHaveBeenCalledWith({
      function_id: "Fn1",
      visibility: "everyone",
    });
  });
});
