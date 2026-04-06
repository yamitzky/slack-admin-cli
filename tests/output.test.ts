import { describe, expect, test } from "bun:test";
import { formatJson, formatTable, formatPlain } from "../src/output";

const sampleData = [
  { id: "T001", name: "workspace-1", domain: "ws1" },
  { id: "T002", name: "workspace-2", domain: "ws2" },
];

describe("formatJson", () => {
  test("outputs valid JSON", () => {
    const result = formatJson(sampleData);
    expect(JSON.parse(result)).toEqual(sampleData);
  });

  test("pretty prints with 2-space indent", () => {
    const result = formatJson(sampleData);
    expect(result).toBe(JSON.stringify(sampleData, null, 2));
  });
});

describe("formatTable", () => {
  test("renders header and rows", () => {
    const result = formatTable(sampleData, ["id", "name", "domain"]);
    const lines = result.split("\n").filter(Boolean);
    expect(lines[0]).toContain("ID");
    expect(lines[0]).toContain("NAME");
    expect(lines[0]).toContain("DOMAIN");
    expect(lines).toHaveLength(4); // header + separator + 2 rows
  });

  test("handles empty data", () => {
    const result = formatTable([], ["id", "name"]);
    expect(result).toContain("No results");
  });
});

describe("formatPlain", () => {
  test("outputs TSV", () => {
    const result = formatPlain(sampleData, ["id", "name", "domain"]);
    const lines = result.split("\n").filter(Boolean);
    expect(lines[0]).toBe("T001\tworkspace-1\tws1");
    expect(lines[1]).toBe("T002\tworkspace-2\tws2");
  });

  test("handles empty data", () => {
    const result = formatPlain([], ["id", "name"]);
    expect(result).toBe("");
  });
});
