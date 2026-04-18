import { describe, expect, test, mock } from "bun:test";
import { executeUsersSetPresence } from "../../../src/commands/users/set-presence";

describe("users set-presence", () => {
  test("calls setPresence with auto|away", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true }));
    const client = { users: { setPresence: mockSet } } as any;
    await executeUsersSetPresence(client, { presence: "away" });
    expect(mockSet).toHaveBeenCalledWith({ presence: "away" });
  });
});
