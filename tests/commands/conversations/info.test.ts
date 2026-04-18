import { describe, expect, test, mock } from "bun:test";
import { executeConversationsInfo } from "../../../src/commands/conversations/info";

describe("conversations info", () => {
  test("returns channel object", async () => {
    const mockInfo = mock(() => Promise.resolve({ ok: true, channel: { id: "C001", name: "general" } }));
    const client = { conversations: { info: mockInfo } } as any;
    const result = await executeConversationsInfo(client, { channel: "C001" });
    expect(result?.id).toBe("C001");
    expect(mockInfo).toHaveBeenCalledWith({ channel: "C001" });
  });

  test("passes include flags", async () => {
    const mockInfo = mock(() => Promise.resolve({ ok: true, channel: {} }));
    const client = { conversations: { info: mockInfo } } as any;
    await executeConversationsInfo(client, { channel: "C001", includeLocale: true, includeNumMembers: true });
    expect(mockInfo).toHaveBeenCalledWith({ channel: "C001", include_locale: true, include_num_members: true });
  });
});
