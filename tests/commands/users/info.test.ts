import { describe, expect, test, mock } from "bun:test";
import { executeUsersInfo } from "../../../src/commands/users/info";

describe("users info", () => {
  test("returns user object", async () => {
    const mockInfo = mock(() => Promise.resolve({ ok: true, user: { id: "U001", name: "alice" } }));
    const client = { users: { info: mockInfo } } as any;
    const result = await executeUsersInfo(client, { user: "U001" });
    expect(result?.id).toBe("U001");
    expect(mockInfo).toHaveBeenCalledWith({ user: "U001" });
  });

  test("passes include_locale", async () => {
    const mockInfo = mock(() => Promise.resolve({ ok: true, user: { id: "U001" } }));
    const client = { users: { info: mockInfo } } as any;
    await executeUsersInfo(client, { user: "U001", includeLocale: true });
    expect(mockInfo).toHaveBeenCalledWith({ user: "U001", include_locale: true });
  });
});
