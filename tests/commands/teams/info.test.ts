import { describe, expect, test, mock } from "bun:test";
import { executeTeamsInfo } from "../../../src/commands/teams/info";

describe("teams info", () => {
  test("returns team object", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, team: { id: "T001", name: "example" } }));
    const client = { team: { info: mockCall } } as any;
    const result = await executeTeamsInfo(client, {});
    expect(result?.id).toBe("T001");
    expect(mockCall).toHaveBeenCalledWith({});
  });

  test("passes team and domain", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, team: {} }));
    const client = { team: { info: mockCall } } as any;
    await executeTeamsInfo(client, { team: "T001", domain: "example" });
    expect(mockCall).toHaveBeenCalledWith({ team: "T001", domain: "example" });
  });
});
