import type { Transaction } from "./types";

function splitLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if ((c === "," || c === ";") && !q) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function normDate(s: string): string | null {
  const iso = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  const dmy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Parses a CSV with columns date, description, amount. Returns rows + count of skipped lines. */
export function parseStatementCsv(text: string): { rows: Transaction[]; skipped: number } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { rows: [], skipped: 0 };
  const header = splitLine(lines[0]).map((h) => h.toLowerCase());
  let di = header.indexOf("date");
  let de = header.indexOf("description");
  let ai = header.indexOf("amount");
  let start = 1;
  if (di < 0 || de < 0 || ai < 0) {
    di = 0;
    de = 1;
    ai = 2;
    start = 0;
  }
  const rows: Transaction[] = [];
  let skipped = 0;
  for (let i = start; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    const date = normDate(cols[di] ?? "");
    const amount = Number((cols[ai] ?? "").replace(/[^0-9.\-]/g, ""));
    const description = cols[de] ?? "";
    if (!date || !description || !isFinite(amount) || amount === 0) {
      skipped++;
      continue;
    }
    rows.push({
      id: `csv-${i}-${Math.random().toString(36).slice(2, 8)}`,
      date,
      description,
      amount,
      category: amount > 0 ? "Income" : "Other",
    });
  }
  return { rows, skipped };
}
