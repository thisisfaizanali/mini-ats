// Spreadsheet apps execute cells starting with these as formulas; a leading '
// forces them to be read as text (CSV/formula injection).
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: string) {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(rows: string[][]): string {
  return "\uFEFF" + rows.map((r) => r.map(cell).join(",") + "\r\n").join("");
}
