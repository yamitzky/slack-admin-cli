import { describe, expect, test, mock } from "bun:test";
import { executeUsersUnsupportedVersionsExport } from "../../../../src/commands/users/unsupported-versions/export";

describe("users unsupported-versions export", () => {
  test("calls admin.users.unsupportedVersions.export", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { users: { unsupportedVersions: { export: mockFn } } },
    } as any;
    await executeUsersUnsupportedVersionsExport(client, {
      dateEndOfSupport: 1700000000,
      dateSessionsStarted: 1690000000,
    });
    expect(mockFn).toHaveBeenCalledWith({
      date_end_of_support: 1700000000,
      date_sessions_started: 1690000000,
    });
  });
});
