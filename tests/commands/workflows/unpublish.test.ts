import { describe, expect, test, mock } from "bun:test";
import { executeWorkflowsUnpublish } from "../../../src/commands/workflows/unpublish";

describe("workflows unpublish", () => {
  test("calls admin.workflows.unpublish with correct params", async () => {
    const mockUnpublish = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { workflows: { unpublish: mockUnpublish } } } as any;

    await executeWorkflowsUnpublish(client, { workflowIds: ["W1", "W2"] });

    expect(mockUnpublish).toHaveBeenCalledWith({ workflow_ids: ["W1", "W2"] });
  });
});
