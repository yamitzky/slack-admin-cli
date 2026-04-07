import type { WebClient } from "@slack/web-api";

export async function executeWorkflowsCollaboratorsAdd(
  client: WebClient,
  args: { collaboratorIds: [string, ...string[]]; workflowIds: [string, ...string[]] },
): Promise<void> {
  await client.admin.workflows.collaborators.add({
    collaborator_ids: args.collaboratorIds,
    workflow_ids: args.workflowIds,
  });
}
