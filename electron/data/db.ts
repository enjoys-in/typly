import Database from 'better-sqlite3';
import { databasePath } from '../shell/portable';

// Plain row shapes (kept local so the main process doesn't depend on renderer src).
interface Mistake {
  category: string;
  expected: string;
  typed: string;
  index: number;
}
interface TimelinePoint {
  bucket: number;
  wpm: number;
  accuracy: number;
}
interface Keystroke {
  t: number;
  key: string;
  expected: string;
  correct: boolean;
  index: number;
}
interface TestResultRow {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  charsTyped: number;
  correctChars: number;
  incorrectChars: number;
  correctWords: number;
  wrongWords: number;
  backspaces: number;
  deletes: number;
  errors: number;
  status: string;
}
interface TestRow {
  id: number;
  createdAt: string;
  documentId: number | null;
  lang: string;
  examBoard: string;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  errors: number;
  durationSec: number;
  status: string;
}
interface SaveTestPayload {
  createdAt: string;
  documentId: number | null;
  lang: string;
  examBoard: string;
  durationSec: number;
  result: TestResultRow;
  mistakes: Mistake[];
  timeline: TimelinePoint[];
  keystrokes: Keystroke[];
}
interface DocumentInput {
  title: string;
  lang: string;
  sourceType: string;
  content: string;
}
interface DocumentRow extends DocumentInput {
  id: number;
  charCount: number;
  createdAt: string;
}
interface FullResult {
  row: TestRow;
  result: TestResultRow;
  mistakes: Mistake[];
  keystrokes: Keystroke[];
}
interface BackupBundle {
  app: string;
  version: number;
  exportedAt: string;
  counts: { tests: number; documents: number };
  tables: Record<string, unknown[]>;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT, createdAt TEXT NOT NULL, documentId INTEGER,
  lang TEXT NOT NULL, examBoard TEXT NOT NULL, grossWpm REAL, netWpm REAL, accuracy REAL,
  errors INTEGER, durationSec INTEGER, status TEXT);
CREATE TABLE IF NOT EXISTS results (
  testId INTEGER PRIMARY KEY, grossWpm REAL, netWpm REAL, accuracy REAL, charsTyped INTEGER,
  correctChars INTEGER, incorrectChars INTEGER, correctWords INTEGER, wrongWords INTEGER,
  backspaces INTEGER, deletes INTEGER, errors INTEGER, status TEXT);
CREATE TABLE IF NOT EXISTS mistakes (
  id INTEGER PRIMARY KEY AUTOINCREMENT, testId INTEGER, category TEXT, expected TEXT, typed TEXT, "index" INTEGER);
CREATE TABLE IF NOT EXISTS timeline (
  id INTEGER PRIMARY KEY AUTOINCREMENT, testId INTEGER, bucket INTEGER, wpm REAL, accuracy REAL);
CREATE TABLE IF NOT EXISTS keystrokes (
  testId INTEGER PRIMARY KEY, log TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, lang TEXT, sourceType TEXT, content TEXT,
  charCount INTEGER, createdAt TEXT);
CREATE TABLE IF NOT EXISTS settings ( key TEXT PRIMARY KEY, value TEXT );`;

// Canonical desktop store — the §9 schema in better-sqlite3, exposed to the
// renderer over IPC. Methods mirror the browser Repository one-for-one.
export class SqliteRepository {
  private db: Database.Database;

  constructor() {
    // Beside the executable in a portable build, in the user profile otherwise.
    this.db = new Database(databasePath());
    this.db.pragma('journal_mode = WAL');
    this.db.exec(SCHEMA);
    this.migrate();
  }

  /** Add columns that arrived after a database was first created. */
  private migrate(): void {
    const columns = (this.db.prepare(`PRAGMA table_info(results)`).all() as { name: string }[]).map(
      (c) => c.name,
    );
    if (!columns.includes('deletes')) {
      this.db.exec(`ALTER TABLE results ADD COLUMN deletes INTEGER`);
    }
  }

  saveTest(payload: SaveTestPayload): number {
    const tx = this.db.transaction((p: SaveTestPayload) => {
      const r = p.result;
      const id = Number(
        this.db
          .prepare(
            `INSERT INTO tests (createdAt, documentId, lang, examBoard, grossWpm, netWpm, accuracy, errors, durationSec, status)
             VALUES (?,?,?,?,?,?,?,?,?,?)`,
          )
          .run(p.createdAt, p.documentId, p.lang, p.examBoard, r.grossWpm, r.netWpm, r.accuracy, r.errors, p.durationSec, r.status)
          .lastInsertRowid,
      );
      this.db
        .prepare(
          `INSERT INTO results (testId, grossWpm, netWpm, accuracy, charsTyped, correctChars, incorrectChars, correctWords, wrongWords, backspaces, deletes, errors, status)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(id, r.grossWpm, r.netWpm, r.accuracy, r.charsTyped, r.correctChars, r.incorrectChars, r.correctWords, r.wrongWords, r.backspaces, r.deletes, r.errors, r.status);
      const mStmt = this.db.prepare(`INSERT INTO mistakes (testId, category, expected, typed, "index") VALUES (?,?,?,?,?)`);
      for (const m of p.mistakes) mStmt.run(id, m.category, m.expected, m.typed, m.index);
      const tStmt = this.db.prepare(`INSERT INTO timeline (testId, bucket, wpm, accuracy) VALUES (?,?,?,?)`);
      for (const t of p.timeline) tStmt.run(id, t.bucket, t.wpm, t.accuracy);
      if (p.keystrokes.length > 0) this.putKeystrokes(id, p.keystrokes);
      return id;
    });
    return tx(payload);
  }

  listHistory(): TestRow[] {
    return this.db.prepare(`SELECT * FROM tests ORDER BY createdAt DESC`).all() as TestRow[];
  }

  getResult(id: number): FullResult | null {
    const row = this.db.prepare(`SELECT * FROM tests WHERE id = ?`).get(id) as TestRow | undefined;
    const result = this.db
      .prepare(
        `SELECT grossWpm, netWpm, accuracy, charsTyped, correctChars, incorrectChars, correctWords, wrongWords,
                backspaces, COALESCE(deletes, 0) AS deletes, errors, status FROM results WHERE testId = ?`,
      )
      .get(id) as TestResultRow | undefined;
    if (!row || !result) return null;
    const mistakes = this.db
      .prepare(`SELECT category, expected, typed, "index" FROM mistakes WHERE testId = ?`)
      .all(id) as Mistake[];
    return { row, result, mistakes, keystrokes: this.getKeystrokes(id) };
  }

  saveDocument(doc: DocumentInput): number {
    return this.insertDocument(doc.title, doc.lang, doc.sourceType, doc.content, doc.content.length, new Date().toISOString());
  }

  private insertDocument(title: string, lang: string, sourceType: string, content: string, charCount: number, createdAt: string): number {
    return Number(
      this.db
        .prepare(`INSERT INTO documents (title, lang, sourceType, content, charCount, createdAt) VALUES (?,?,?,?,?,?)`)
        .run(title, lang, sourceType, content, charCount, createdAt).lastInsertRowid,
    );
  }

  listDocuments(): DocumentRow[] {
    return this.db.prepare(`SELECT * FROM documents ORDER BY createdAt DESC`).all() as DocumentRow[];
  }

  getDocument(id: number): DocumentRow | null {
    return (this.db.prepare(`SELECT * FROM documents WHERE id = ?`).get(id) as DocumentRow | undefined) ?? null;
  }

  // The paragraph goes, its results stay: past scores are still the user's
  // history, they just no longer point at a document that exists.
  deleteDocument(id: number): void {
    this.db.transaction(() => {
      this.db.prepare(`UPDATE tests SET documentId = NULL WHERE documentId = ?`).run(id);
      this.db.prepare(`DELETE FROM documents WHERE id = ?`).run(id);
    })();
  }

  getSetting(key: string): string | null {
    const row = this.db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as { value: string } | undefined;
    return row?.value ?? null;
  }

  setSetting(key: string, value: string): void {
    this.db
      .prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`)
      .run(key, value);
  }

  aggregateMistakes(): Mistake[] {
    return this.db.prepare(`SELECT category, expected, typed, "index" FROM mistakes`).all() as Mistake[];
  }

  // Keystroke logs are stored as one JSON document per test: they are thousands
  // of rows per run and are only ever read back whole.
  private putKeystrokes(testId: number, log: Keystroke[]): void {
    this.db
      .prepare(
        `INSERT INTO keystrokes (testId, log) VALUES (?, ?)
         ON CONFLICT(testId) DO UPDATE SET log = excluded.log`,
      )
      .run(testId, JSON.stringify(log));
  }

  getKeystrokes(testId: number): Keystroke[] {
    const row = this.db.prepare(`SELECT log FROM keystrokes WHERE testId = ?`).get(testId) as
      | { log: string }
      | undefined;
    if (!row) return [];
    try {
      return JSON.parse(row.log) as Keystroke[];
    } catch {
      return [];
    }
  }

  recentKeystrokes(limit: number): Keystroke[] {
    const rows = this.db
      .prepare(
        `SELECT k.log FROM keystrokes k JOIN tests t ON t.id = k.testId
         ORDER BY t.createdAt DESC LIMIT ?`,
      )
      .all(limit) as { log: string }[];
    return rows.flatMap((r) => {
      try {
        return JSON.parse(r.log) as Keystroke[];
      } catch {
        return [];
      }
    });
  }

  /**
   * The newest `limit` tests in full, kept per test rather than flattened —
   * what a longitudinal heatmap or a fatigue curve reads.
   */
  recentResults(limit: number): FullResult[] {
    const ids = this.db
      .prepare(`SELECT id FROM tests ORDER BY createdAt DESC LIMIT ?`)
      .all(limit) as { id: number }[];
    return ids
      .map((row) => this.getResult(row.id))
      .filter((full): full is FullResult => full !== null);
  }

  exportBackup(): BackupBundle {
    const tables = {
      tests: this.db.prepare(`SELECT * FROM tests`).all(),
      results: this.db.prepare(`SELECT * FROM results`).all(),
      mistakes: this.db.prepare(`SELECT * FROM mistakes`).all(),
      timeline: this.db.prepare(`SELECT * FROM timeline`).all(),
      keystrokes: (this.db.prepare(`SELECT testId FROM keystrokes`).all() as { testId: number }[]).map(
        (r) => ({ testId: r.testId, keystrokes: this.getKeystrokes(r.testId) }),
      ),
      documents: this.db.prepare(`SELECT * FROM documents`).all(),
      settings: this.db.prepare(`SELECT * FROM settings`).all(),
    };
    return {
      app: 'typly',
      version: 1,
      exportedAt: new Date().toISOString(),
      counts: { tests: tables.tests.length, documents: tables.documents.length },
      tables,
    };
  }

  // Merge a backup, remapping auto-increment ids so nothing collides.
  importBackup(bundle: BackupBundle): void {
    const t = bundle.tables as {
      tests?: TestRow[];
      results?: (TestResultRow & { testId: number })[];
      mistakes?: (Mistake & { testId: number })[];
      timeline?: (TimelinePoint & { testId: number })[];
      keystrokes?: { testId: number; keystrokes: Keystroke[] }[];
      documents?: DocumentRow[];
      settings?: { key: string; value: string }[];
    };
    this.db.transaction(() => {
      const docMap = new Map<number, number>();
      for (const d of t.documents ?? []) {
        docMap.set(d.id, this.insertDocument(d.title, d.lang, d.sourceType, d.content, d.charCount, d.createdAt));
      }
      const testMap = new Map<number, number>();
      const insTest = this.db.prepare(
        `INSERT INTO tests (createdAt, documentId, lang, examBoard, grossWpm, netWpm, accuracy, errors, durationSec, status) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      );
      for (const row of t.tests ?? []) {
        const documentId = row.documentId != null ? (docMap.get(row.documentId) ?? null) : null;
        const id = Number(
          insTest.run(row.createdAt, documentId, row.lang, row.examBoard, row.grossWpm, row.netWpm, row.accuracy, row.errors, row.durationSec, row.status).lastInsertRowid,
        );
        testMap.set(row.id, id);
      }
      const insRes = this.db.prepare(
        `INSERT INTO results (testId, grossWpm, netWpm, accuracy, charsTyped, correctChars, incorrectChars, correctWords, wrongWords, backspaces, deletes, errors, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      );
      for (const r of t.results ?? []) {
        const testId = testMap.get(r.testId);
        if (testId == null) continue;
        insRes.run(testId, r.grossWpm, r.netWpm, r.accuracy, r.charsTyped, r.correctChars, r.incorrectChars, r.correctWords, r.wrongWords, r.backspaces, r.deletes ?? 0, r.errors, r.status);
      }
      const insMis = this.db.prepare(`INSERT INTO mistakes (testId, category, expected, typed, "index") VALUES (?,?,?,?,?)`);
      for (const m of t.mistakes ?? []) {
        const testId = testMap.get(m.testId);
        if (testId != null) insMis.run(testId, m.category, m.expected, m.typed, m.index);
      }
      const insTl = this.db.prepare(`INSERT INTO timeline (testId, bucket, wpm, accuracy) VALUES (?,?,?,?)`);
      for (const tl of t.timeline ?? []) {
        const testId = testMap.get(tl.testId);
        if (testId != null) insTl.run(testId, tl.bucket, tl.wpm, tl.accuracy);
      }
      for (const k of t.keystrokes ?? []) {
        const testId = testMap.get(k.testId);
        if (testId != null) this.putKeystrokes(testId, k.keystrokes ?? []);
      }
      for (const s of t.settings ?? []) this.setSetting(s.key, s.value);
    })();
  }
}
