import { describe, expect, test, mock } from "bun:test";
import { executeRolesRemoveAssignments } from "../../../src/commands/roles/remove-assignments";

describe("roles remove-assignments", () => {
  test("calls admin.roles.removeAssignments", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { roles: { removeAssignments: mockFn } } } as any;
    await executeRolesRemoveAssignments(client, {
      roleId: "Rl0",
      entityIds: ["T001"],
      userIds: ["U001"],
    });
    expect(mockFn).toHaveBeenCalledWith({
      role_id: "Rl0",
      entity_ids: ["T001"],
      user_ids: ["U001"],
    });
  });
});
