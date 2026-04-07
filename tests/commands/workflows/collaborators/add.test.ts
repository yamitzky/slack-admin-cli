import { describe, expect, test, mock } from "bun:test";
import { executeWorkflowsCollaboratorsAdd } from "../../../../src/commands/workflows/collaborators/add";

describe("workflows collaborators add", () => {
  test("calls admin.workflows.collaborators.add with correct params", async () => {
    const mockAdd = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { workflows: { collaborators: { add: mockAdd } } } } as any;

    await executeWorkflowsCollaboratorsAdd(client, {
      collaboratorIds: ["U1", "U2"],
      workflowIds: ["W1"],
    });

    expect(mockAdd).toHaveBeenCalledWith({
      collaborator_ids: ["U1", "U2"],
      workflow_ids: ["W1"],
    });
  });
});
