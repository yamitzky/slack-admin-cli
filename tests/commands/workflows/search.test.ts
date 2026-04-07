import { describe, expect, test, mock } from "bun:test";
import { executeWorkflowsSearch } from "../../../src/commands/workflows/search";

describe("workflows search", () => {
  test("calls admin.workflows.search with params", async () => {
    const mockSearch = mock(() =>
      Promise.resolve({ ok: true, workflows: [{ id: "W1", title: "My Workflow" }] }),
    );
    const client = { admin: { workflows: { search: mockSearch } } } as any;

    const result = await executeWorkflowsSearch(client, {
      query: "test",
      source: "workflow_builder",
      limit: 5,
    });

    expect(mockSearch).toHaveBeenCalledWith({
      query: "test",
      source: "workflow_builder",
      limit: 5,
    });
    expect(result).toHaveLength(1);
  });

  test("calls with no params", async () => {
    const mockSearch = mock(() =>
      Promise.resolve({ ok: true, workflows: [] }),
    );
    const client = { admin: { workflows: { search: mockSearch } } } as any;

    const result = await executeWorkflowsSearch(client, {});

    expect(mockSearch).toHaveBeenCalledWith({});
    expect(result).toHaveLength(0);
  });
});
