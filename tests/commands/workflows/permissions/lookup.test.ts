import { describe, expect, test, mock } from "bun:test";
import { executeWorkflowsPermissionsLookup } from "../../../../src/commands/workflows/permissions/lookup";

describe("workflows permissions lookup", () => {
  test("calls admin.workflows.permissions.lookup with correct params", async () => {
    const mockLookup = mock(() =>
      Promise.resolve({ ok: true, permissions: [{ workflow_id: "W1" }] }),
    );
    const client = { admin: { workflows: { permissions: { lookup: mockLookup } } } } as any;

    const result = await executeWorkflowsPermissionsLookup(client, {
      workflowIds: ["W1"],
      maxWorkflowTriggers: 5,
    });

    expect(mockLookup).toHaveBeenCalledWith({
      workflow_ids: ["W1"],
      max_workflow_triggers: 5,
    });
    expect(result).toHaveLength(1);
  });
});
