import { describe, expect, test, mock } from "bun:test";
import { executeSessionReset } from "../../../src/commands/users/session-reset";

describe("users session reset", () => {
  test("calls session.reset with user_id", async () => {
    const mockReset = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { session: { reset: mockReset } } } } as any;
    await executeSessionReset(client, { userId: "U001" });
    expect(mockReset).toHaveBeenCalledWith({ user_id: "U001" });
  });

  test("passes mobile_only flag", async () => {
    const mockReset = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { session: { reset: mockReset } } } } as any;
    await executeSessionReset(client, { userId: "U001", mobileOnly: true });
    expect(mockReset).toHaveBeenCalledWith({ user_id: "U001", mobile_only: true });
  });

  test("passes web_only flag", async () => {
    const mockReset = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { session: { reset: mockReset } } } } as any;
    await executeSessionReset(client, { userId: "U001", webOnly: true });
    expect(mockReset).toHaveBeenCalledWith({ user_id: "U001", web_only: true });
  });
});
