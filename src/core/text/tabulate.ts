/**
 * Turning an imported form or register into a data-entry source.
 *
 * A DEST candidate copies from a printed table, and the OCR pipeline can
 * already read one — but Tesseract returns plain text, so the column structure
 * survives only as *runs of spaces*. That is enough to recover: two or more
 * spaces between values almost always means a column gap, and one space means a
 * gap between words inside a cell.
 *
 * Recovering it matters because the register view and the key-depression count
 * both assume Tab-separated fields. Without this, a scanned form imports as one
 * long paragraph and the whole data-entry mode has nothing real to work on.
 */

/** A column gap is at least this many consecutive spaces. */
const COLUMN_GAP = /[ \t]{2,}/g;

export interface TabulateResult {
  text: string;
  /** Rows that came out with more than one field. */
  rows: number;
  /** The most common field count — the table's apparent width. */
  columns: number;
}

/**
 * Converts space-aligned text to Tab-separated rows.
 *
 * Blank lines are dropped rather than kept: in a scanned register they are the
 * rules between rows, not empty records, and an empty record would be counted
 * as a row the candidate has to type.
 */
export function tabulate(text: string): TabulateResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const widths = new Map<number, number>();
  const rows = lines.map((line) => {
    const fields = line.split(COLUMN_GAP);
    widths.set(fields.length, (widths.get(fields.length) ?? 0) + 1);
    return fields.join('\t');
  });

  // The modal field count, which is the table's real width — a stray header or
  // a footer note should not decide it.
  let columns = 1;
  let best = 0;
  for (const [width, count] of widths) {
    if (count > best || (count === best && width > columns)) {
      best = count;
      columns = width;
    }
  }

  return {
    text: rows.join('\n'),
    rows: rows.filter((row) => row.includes('\t')).length,
    columns,
  };
}

/**
 * Whether text looks like a table worth offering to convert.
 *
 * Deliberately conservative: prose occasionally has a double space after a full
 * stop, so a single aligned-looking line is not evidence. Several lines with the
 * same field count is.
 */
export function looksTabular(text: string): boolean {
  const result = tabulate(text);
  return result.columns >= 2 && result.rows >= 3;
}

/** True once the text already uses tabs, so there is nothing left to recover. */
export function isTabSeparated(text: string): boolean {
  return text.includes('\t');
}
