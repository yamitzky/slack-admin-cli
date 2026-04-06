export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function formatTable(
  data: Record<string, unknown>[],
  columns: string[],
): string {
  if (data.length === 0) return "No results";

  const headers = columns.map((c) => c.toUpperCase());
  const rows = data.map((row) =>
    columns.map((c) => String(row[c] ?? "")),
  );

  const widths = columns.map((col, i) =>
    Math.max(headers[i].length, ...rows.map((r) => r[i].length)),
  );

  const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join("  ");
  const separator = widths.map((w) => "-".repeat(w)).join("  ");
  const bodyLines = rows.map((r) =>
    r.map((cell, i) => cell.padEnd(widths[i])).join("  "),
  );

  return [headerLine, separator, ...bodyLines].join("\n");
}

export function formatPlain(
  data: Record<string, unknown>[],
  columns: string[],
): string {
  return data
    .map((row) => columns.map((c) => String(row[c] ?? "")).join("\t"))
    .join("\n");
}

export type OutputFormat = "json" | "table" | "plain";

export function formatOutput(
  data: Record<string, unknown>[],
  columns: string[],
  format: OutputFormat,
): string {
  switch (format) {
    case "json":
      return formatJson(data);
    case "plain":
      return formatPlain(data, columns);
    case "table":
      return formatTable(data, columns);
  }
}
