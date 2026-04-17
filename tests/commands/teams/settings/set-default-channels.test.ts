import { describe, expect, test, mock } from "bun:test";
import { executeSetDefaultChannels } from "../../../../src/commands/teams/settings/set-default-channels";

describe("teams settings set-default-channels", () => {
  test("calls admin.teams.settings.setDefaultChannels", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { teams: { settings: { setDefaultChannels: mockFn } } } } as any;
    await executeSetDefaultChannels(client, {
      teamId: "T001",
      channelIds: ["C001", "C002"],
    });
    expect(mockFn).toHaveBeenCalledWith({
      team_id: "T001",
      channel_ids: ["C001", "C002"],
    });
  });
});
