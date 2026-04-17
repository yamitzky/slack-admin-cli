import { describe, expect, test, mock } from "bun:test";
import { executeRolesAddAssignments } from "../../../src/commands/roles/add-assignments";

describe("roles add-assignments", () => {
  test("calls admin.roles.addAssignments", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { roles: { addAssignments: mockFn } } } as any;
    await executeRolesAddAssignments(client, {
      roleId: "Rl0123",
      entityIds: ["T001"],
      userIds: ["U001", "U002"],
    });
    expect(mockFn).toHaveBeenCalledWith({
      role_id: "Rl0123",
      entity_ids: ["T001"],
      user_ids: ["U001", "U002"],
    });
  });
});
