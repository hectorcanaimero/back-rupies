/**
 * Converts an array of objects to a CSV string.
 * - Header row is derived from the first object's keys.
 * - Values are stringified and quoted if they contain commas, quotes, or newlines.
 * - Null/undefined values are rendered as empty string.
 *
 * @param data - Array of plain objects (rows)
 * @param columns - Optional explicit column definitions { key, label }. If omitted, uses all keys from first row.
 * @returns CSV string (UTF-8, comma-separated, CRLF line endings per RFC 4180)
 */
export function toCsv<T extends Record<string, unknown>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return "";

  const cols = columns
    ? columns
    : (Object.keys(data[0]) as (keyof T)[]).map((k) => ({
        key: k,
        label: String(k),
      }));

  function escapeCell(value: unknown): string {
    const str = value == null ? "" : String(value);
    // Wrap in quotes if contains comma, quote, newline, or carriage return
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const header = cols.map((c) => escapeCell(c.label)).join(",");
  const rows = data.map((row) =>
    cols.map((c) => escapeCell(row[c.key])).join(",")
  );

  return [header, ...rows].join("\r\n");
}

/**
 * Converts data to CSV and triggers a file download in the browser.
 *
 * @param data - Array of plain objects
 * @param filename - Output filename (without .csv extension)
 * @param columns - Optional explicit column definitions
 */
export function downloadCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void {
  const csv = toCsv(data, columns);
  const bom = "\uFEFF"; // UTF-8 BOM — required for Excel to recognize encoding
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
