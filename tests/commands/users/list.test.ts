import { describe, expect, test, mock } from "bun:test";
import { executeUsersList } from "../../../src/commands/users/list";

describe("users list", () => {
  test("returns users from API", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, users: [{ id: "U001", email: "a@ex.com", is_admin: false }, { id: "U002", email: "b@ex.com", is_admin: true }] }));
    const client = { admin: { users: { list: mockList } } } as any;
    const result = await executeUsersList(client, { teamId: "T001" });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("U001");
  });

  test("passes optional filters", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, users: [] }));
    const client = { admin: { users: { list: mockList } } } as any;
    await executeUsersList(client, { teamId: "T001", isActive: true, cursor: "c1", limit: 25 });
    expect(mockList).toHaveBeenCalledWith({ team_id: "T001", is_active: true, cursor: "c1", limit: 25 });
  });
});
