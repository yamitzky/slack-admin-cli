import { describe, expect, test, mock } from "bun:test";
import { executeUsersLookupByEmail } from "../../../src/commands/users/lookup-by-email";

describe("users lookup-by-email", () => {
  test("returns user for given email", async () => {
    const mockLookup = mock(() => Promise.resolve({ ok: true, user: { id: "U001", profile: { email: "a@ex.com" } } }));
    const client = { users: { lookupByEmail: mockLookup } } as any;
    const result = await executeUsersLookupByEmail(client, { email: "a@ex.com" });
    expect(result?.id).toBe("U001");
    expect(mockLookup).toHaveBeenCalledWith({ email: "a@ex.com" });
  });
});
