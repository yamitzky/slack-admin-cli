import { describe, expect, test, mock } from "bun:test";
import { executeSetIcon } from "../../../../src/commands/teams/settings/set-icon";

describe("teams settings set-icon", () => {
  test("calls setIcon with team_id and image_url", async () => {
    const mockSetIcon = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { teams: { settings: { setIcon: mockSetIcon } } },
    } as any;

    await executeSetIcon(client, {
      teamId: "T001",
      imageUrl: "https://example.com/icon.png",
    });
    expect(mockSetIcon).toHaveBeenCalledWith({
      team_id: "T001",
      image_url: "https://example.com/icon.png",
    });
  });
});
