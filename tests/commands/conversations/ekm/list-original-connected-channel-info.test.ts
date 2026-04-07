import { describe, expect, test, mock } from "bun:test";
import { executeEkmListOriginalConnectedChannelInfo } from "../../../../src/commands/conversations/ekm/list-original-connected-channel-info";

describe("conversations ekm list-original-connected-channel-info", () => {
  test("calls with all params", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, channels: [{ id: "C1" }] }));
    const client = {
      admin: { conversations: { ekm: { listOriginalConnectedChannelInfo: mockList } } },
    } as any;

    await executeEkmListOriginalConnectedChannelInfo(client, {
      teamIds: ["T1"],
      channelIds: ["C1", "C2"],
      cursor: "abc",
      limit: 10,
    });

    expect(mockList).toHaveBeenCalledWith({
      team_ids: ["T1"],
      channel_ids: ["C1", "C2"],
      cursor: "abc",
      limit: 10,
    });
  });

  test("calls with no params", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, channels: [] }));
    const client = {
      admin: { conversations: { ekm: { listOriginalConnectedChannelInfo: mockList } } },
    } as any;

    await executeEkmListOriginalConnectedChannelInfo(client, {});

    expect(mockList).toHaveBeenCalledWith({});
  });
});
