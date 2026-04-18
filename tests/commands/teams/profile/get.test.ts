import { describe, expect, test, mock } from "bun:test";
import { executeTeamsProfileGet } from "../../../../src/commands/teams/profile/get";

describe("teams profile get", () => {
  test("returns profile object", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, profile: { fields: [{ id: "Xf001" }] } }));
    const client = { team: { profile: { get: mockCall } } } as any;
    const result = await executeTeamsProfileGet(client, {});
    expect(result?.fields).toHaveLength(1);
    expect(mockCall).toHaveBeenCalledWith({});
  });

  test("passes visibility", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, profile: {} }));
    const client = { team: { profile: { get: mockCall } } } as any;
    await executeTeamsProfileGet(client, { visibility: "all" });
    expect(mockCall).toHaveBeenCalledWith({ visibility: "all" });
  });
});
