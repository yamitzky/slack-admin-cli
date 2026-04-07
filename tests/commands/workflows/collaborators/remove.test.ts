import { describe, expect, test, mock } from "bun:test";
import { executeWorkflowsCollaboratorsRemove } from "../../../../src/commands/workflows/collaborators/remove";

describe("workflows collaborators remove", () => {
  test("calls admin.workflows.collaborators.remove with correct params", async () => {
    const mockRemove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { workflows: { collaborators: { remove: mockRemove } } } } as any;

    await executeWorkflowsCollaboratorsRemove(client, {
      collaboratorIds: ["U1"],
      workflowIds: ["W1", "W2"],
    });

    expect(mockRemove).toHaveBeenCalledWith({
      collaborator_ids: ["U1"],
      workflow_ids: ["W1", "W2"],
    });
  });
});
