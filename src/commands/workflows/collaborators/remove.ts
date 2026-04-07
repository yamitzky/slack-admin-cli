import type { WebClient } from "@slack/web-api";

export async function executeWorkflowsCollaboratorsRemove(
  client: WebClient,
  args: { collaboratorIds: [string, ...string[]]; workflowIds: [string, ...string[]] },
): Promise<void> {
  await client.admin.workflows.collaborators.remove({
    collaborator_ids: args.collaboratorIds,
    workflow_ids: args.workflowIds,
  });
}
