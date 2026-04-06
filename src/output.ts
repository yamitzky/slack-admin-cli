type Row = Record<string, unknown>;

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function formatTable<T extends Row>(
  data: T[],
  columns: (keyof T & string)[],
): string {
  if (data.length === 0) return "No results";

  const headers = columns.map((c) => c.toUpperCase());
  const rows = data.map((row) =>
    columns.map((c) => String(row[c] ?? "")),
  );

  const widths = columns.map((_col, i) =>
    Math.max(headers[i].length, ...rows.map((r) => r[i].length)),
  );

  const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join("  ");
  const separator = widths.map((w) => "-".repeat(w)).join("  ");
  const bodyLines = rows.map((r) =>
    r.map((cell, i) => cell.padEnd(widths[i])).join("  "),
  );

  return [headerLine, separator, ...bodyLines].join("\n");
}

export function formatPlain<T extends Row>(
  data: T[],
  columns: (keyof T & string)[],
): string {
  return data
    .map((row) => columns.map((c) => String(row[c] ?? "")).join("\t"))
    .join("\n");
}

export type OutputFormat = "json" | "table" | "plain";

export function formatOutput<T extends Row>(
  data: T[],
  columns: (keyof T & string)[],
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
