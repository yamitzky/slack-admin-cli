import type { WebClient } from "@slack/web-api";

export async function executeWorkflowsUnpublish(
  client: WebClient,
  args: { workflowIds: [string, ...string[]] },
): Promise<void> {
  await client.admin.workflows.unpublish({ workflow_ids: args.workflowIds });
}
