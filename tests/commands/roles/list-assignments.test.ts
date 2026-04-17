import { describe, expect, test, mock } from "bun:test";
import { executeRolesListAssignments } from "../../../src/commands/roles/list-assignments";

describe("roles list-assignments", () => {
  test("returns role_assignments", async () => {
    const mockApiCall = mock(() =>
      Promise.resolve({ ok: true, role_assignments: [{ role_id: "Rl0", user_id: "U1" }] }),
    );
    const client = { apiCall: mockApiCall } as any;
    const result = await executeRolesListAssignments(client, {
      roleIds: ["Rl0"],
      cursor: "c",
      limit: 5,
      sortDir: "asc",
    });
    expect(mockApiCall).toHaveBeenCalledWith("admin.roles.listAssignments", {
      role_ids: ["Rl0"],
      cursor: "c",
      limit: 5,
      sort_dir: "asc",
    });
    expect(result).toEqual([{ role_id: "Rl0", user_id: "U1" }]);
  });

  test("returns empty array when role_assignments missing", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;
    const result = await executeRolesListAssignments(client, {});
    expect(mockApiCall).toHaveBeenCalledWith("admin.roles.listAssignments", {});
    expect(result).toEqual([]);
  });
});
