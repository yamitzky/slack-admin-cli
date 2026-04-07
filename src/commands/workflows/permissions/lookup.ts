import type { WebClient } from "@slack/web-api";

interface WorkflowsPermissionsLookupOptions {
  workflowIds: [string, ...string[]];
  maxWorkflowTriggers?: number;
}

export async function executeWorkflowsPermissionsLookup(
  client: WebClient,
  opts: WorkflowsPermissionsLookupOptions,
) {
  const response = await client.admin.workflows.permissions.lookup({
    workflow_ids: opts.workflowIds,
    ...(opts.maxWorkflowTriggers !== undefined ? { max_workflow_triggers: opts.maxWorkflowTriggers } : {}),
  });
  return response.permissions ?? [];
}
