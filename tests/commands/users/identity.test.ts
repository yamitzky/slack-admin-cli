import { describe, expect, test, mock } from "bun:test";
import { executeUsersIdentity } from "../../../src/commands/users/identity";

describe("users identity", () => {
  test("returns identity response", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, user: { id: "U001" }, team: { id: "T001" } }));
    const client = { users: { identity: mockCall } } as any;
    const result = await executeUsersIdentity(client, {});
    expect(result.user?.id).toBe("U001");
    expect(mockCall).toHaveBeenCalledWith({});
  });
});
