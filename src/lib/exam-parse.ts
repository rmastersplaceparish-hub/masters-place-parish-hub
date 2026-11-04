export const EXAM_TEMPLATE_HEADERS = [
  "Question",
  "Option A",
  "Option B",
  "Option C",
  "Option D",
  "Correct Answer",
  "Marks",
] as const;

export interface ParsedQuestion {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  marks: number;
}

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

/** Converts spreadsheet rows (first row = headers) into exam questions. Throws on invalid rows. */
export function parseExamRows(rows: unknown[][]): ParsedQuestion[] {
  const body = rows.slice(1).filter((r) => r.some((c) => str(c) !== ""));
  if (body.length === 0) throw new Error("The file has no questions under the header row.");
  return body.map((r, i) => {
    const line = i + 2;
    const [q, a, b, c, d, ans, m] = r.map(str);
    if (!q || !a || !b || !c || !d) throw new Error(`Row ${line}: question and all four options are required.`);
    let letter = ans.toUpperCase().replace(/^OPTION\s+/, "");
    if (!["A", "B", "C", "D"].includes(letter)) {
      const idx = [a, b, c, d].findIndex((o) => o.toLowerCase() === ans.toLowerCase());
      if (idx < 0) throw new Error(`Row ${line}: correct answer must be A, B, C, D or match an option.`);
      letter = "ABCD"[idx];
    }
    const marks = m === "" ? 1 : Number(m);
    if (!Number.isFinite(marks) || marks < 0) throw new Error(`Row ${line}: marks must be a number.`);
    return { question: q, option_a: a, option_b: b, option_c: c, option_d: d, correct_answer: letter as ParsedQuestion["correct_answer"], marks };
  });
}

/** Empty / blank duration means no time limit. */
export function parseDuration(input: string): number | null {
  const t = input.trim();
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isInteger(n) || n <= 0) throw new Error("Duration must be a whole number of minutes, or left empty.");
  return n;
}
