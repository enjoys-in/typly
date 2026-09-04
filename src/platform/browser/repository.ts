import { IDB, type TableSchema } from '@enjoys/react-api/idb';
import type { EntityTable, Table } from 'dexie';
import type {
  DocumentInput,
  DocumentRow,
  Keystroke,
  Mistake,
  SaveTestPayload,
  TestResult,
  TestRow,
} from '@/core/types';
import type { FullResult, BackupBundle, Repository, TestSummary } from '../ports';

interface TestRecord extends TestRow {}
interface ResultRecord extends TestResult {
  testId: number;
}
interface MistakeRecord extends Mistake {
  id: number;
  testId: number;
}
interface TimelineRecord {
  id: number;
  testId: number;
  bucket: number;
  wpm: number;
  accuracy: number;
}
// One row per test rather than per keystroke: a 10-minute run is thousands of
// keystrokes, and they are only ever read back as a whole log.
interface KeystrokeRecord {
  testId: number;
  keystrokes: Keystroke[];
}
interface DocRecord extends DocumentRow {}
interface SettingRecord {
  key: string;
  value: string;
}

// Row types for CRUD; the EntityTable `Tables` type is only for opening the DB.
interface RowMap {
  tests: TestRecord;
  results: ResultRecord;
  mistakes: MistakeRecord;
  timeline: TimelineRecord;
  keystrokes: KeystrokeRecord;
  documents: DocRecord;
  settings: SettingRecord;
}

type Tables = {
  tests: EntityTable<TestRecord, 'id'>;
  results: EntityTable<ResultRecord, 'testId'>;
  mistakes: EntityTable<MistakeRecord, 'id'>;
  timeline: EntityTable<TimelineRecord, 'id'>;
  keystrokes: EntityTable<KeystrokeRecord, 'testId'>;
  documents: EntityTable<DocRecord, 'id'>;
  settings: EntityTable<SettingRecord, 'key'>;
};

const schema = {
  tests: '++id,createdAt',
  results: 'testId',
  mistakes: '++id,testId',
  timeline: '++id,testId',
  keystrokes: 'testId',
  documents: '++id,createdAt',
  settings: 'key',
} satisfies TableSchema<Tables>;

export class BrowserRepository implements Repository {
  private idb = new IDB<Tables>(schema, 'typly', 2);

  private table<K extends keyof RowMap>(name: K): Table<RowMap[K]> {
    return this.idb.getRawDb().table(name as string) as unknown as Table<RowMap[K]>;
  }

  async saveTest(payload: SaveTestPayload): Promise<number> {
    const { result } = payload;
    const id = (await this.table('tests').add({
      createdAt: payload.createdAt,
      documentId: payload.documentId,
      lang: payload.lang,
      examBoard: payload.examBoard,
      grossWpm: result.grossWpm,
      netWpm: result.netWpm,
      accuracy: result.accuracy,
      errors: result.errors,
      durationSec: payload.durationSec,
      status: result.status,
    } as TestRecord)) as number;

    await this.table('results').add({ testId: id, ...result } as ResultRecord);
    await this.table('mistakes').bulkAdd(
      payload.mistakes.map((m) => ({ testId: id, ...m })) as MistakeRecord[],
    );
    await this.table('timeline').bulkAdd(
      payload.timeline.map((t) => ({ testId: id, ...t })) as TimelineRecord[],
    );
    if (payload.keystrokes.length > 0) {
      await this.table('keystrokes').put({ testId: id, keystrokes: payload.keystrokes });
    }
    return id;
  }

  async listHistory(): Promise<TestRow[]> {
    const rows = (await this.table('tests').toArray()) as TestRecord[];
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getResult(id: number): Promise<FullResult | null> {
    const row = (await this.table('tests').get(id)) as TestRecord | undefined;
    const result = (await this.table('results').get(id)) as ResultRecord | undefined;
    if (!row || !result) return null;
    const mistakes = (await this.table('mistakes')
      .filter((m) => (m as MistakeRecord).testId === id)
      .toArray()) as MistakeRecord[];
    return { row, result, mistakes, keystrokes: await this.getKeystrokes(id) };
  }

  async saveDocument(doc: DocumentInput): Promise<number> {
    return (await this.table('documents').add({
      ...doc,
      charCount: doc.content.length,
      createdAt: new Date().toISOString(),
    } as DocRecord)) as number;
  }

  async listDocuments(): Promise<DocumentRow[]> {
    const rows = (await this.table('documents').toArray()) as DocRecord[];
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getDocument(id: number): Promise<DocumentRow | null> {
    return ((await this.table('documents').get(id)) as DocRecord | undefined) ?? null;
  }

  // The paragraph goes, its results stay: past scores are still the user's
  // history, they just no longer point at a document that exists.
  async deleteDocument(id: number): Promise<void> {
    const tests = (await this.table('tests').toArray()) as TestRecord[];
    const orphaned = tests.filter((t) => t.documentId === id);
    if (orphaned.length > 0) {
      await this.table('tests').bulkPut(orphaned.map((t) => ({ ...t, documentId: null })));
    }
    await this.table('documents').delete(id);
  }

  async getSetting(key: string): Promise<string | null> {
    const row = (await this.table('settings').get(key)) as SettingRecord | undefined;
    return row?.value ?? null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await this.table('settings').put({ key, value });
  }

  async aggregateMistakes(): Promise<Mistake[]> {
    return (await this.table('mistakes').toArray()) as Mistake[];
  }

  async getKeystrokes(testId: number): Promise<Keystroke[]> {
    const row = (await this.table('keystrokes').get(testId)) as KeystrokeRecord | undefined;
    return row?.keystrokes ?? [];
  }

  async recentKeystrokes(limit: number): Promise<Keystroke[]> {
    const recent = (await this.listHistory()).slice(0, limit);
    const logs = await Promise.all(recent.map((row) => this.getKeystrokes(row.id)));
    return logs.flat();
  }

  async recentSummaries(limit: number): Promise<TestSummary[]> {
    const recent = (await this.listHistory()).slice(0, limit);
    const ids = new Set(recent.map((row) => row.id));
    // Two table scans rather than two queries per test: Dexie has no join, and
    // filtering once is cheaper than `limit` round trips.
    const [mistakes, timeline] = await Promise.all([
      this.table('mistakes').filter((m) => ids.has((m as MistakeRecord).testId)).toArray(),
      this.table('timeline').filter((t) => ids.has((t as TimelineRecord).testId)).toArray(),
    ]);
    const byTest = <T extends { testId: number }>(rows: T[]) => {
      const map = new Map<number, T[]>();
      for (const row of rows) {
        const list = map.get(row.testId);
        if (list) list.push(row);
        else map.set(row.testId, [row]);
      }
      return map;
    };
    const mistakesBy = byTest(mistakes as MistakeRecord[]);
    const timelineBy = byTest(timeline as TimelineRecord[]);

    return recent.map((row) => ({
      row,
      mistakes: mistakesBy.get(row.id) ?? [],
      timeline: (timelineBy.get(row.id) ?? []).sort((a, b) => a.bucket - b.bucket),
    }));
  }

  async exportBackup(): Promise<BackupBundle> {
    const [tests, results, mistakes, timeline, keystrokes, documents, settings] = await Promise.all([
      this.table('tests').toArray(),
      this.table('results').toArray(),
      this.table('mistakes').toArray(),
      this.table('timeline').toArray(),
      this.table('keystrokes').toArray(),
      this.table('documents').toArray(),
      this.table('settings').toArray(),
    ]);
    return {
      app: 'typly',
      version: 1,
      exportedAt: new Date().toISOString(),
      counts: { tests: tests.length, documents: documents.length },
      tables: { tests, results, mistakes, timeline, keystrokes, documents, settings },
    };
  }

  // Merge a backup, remapping auto-increment ids so nothing collides with existing rows.
  async importBackup(bundle: BackupBundle): Promise<void> {
    const t = bundle.tables as {
      tests?: TestRecord[];
      results?: ResultRecord[];
      mistakes?: MistakeRecord[];
      timeline?: TimelineRecord[];
      keystrokes?: KeystrokeRecord[];
      documents?: DocRecord[];
      settings?: SettingRecord[];
    };

    const docIdMap = new Map<number, number>();
    for (const d of t.documents ?? []) {
      const newId = (await this.table('documents').add({
        title: d.title,
        lang: d.lang,
        sourceType: d.sourceType,
        content: d.content,
        charCount: d.charCount,
        createdAt: d.createdAt,
      } as DocRecord)) as number;
      docIdMap.set(d.id, newId);
    }

    const testIdMap = new Map<number, number>();
    for (const row of t.tests ?? []) {
      const documentId = row.documentId != null ? (docIdMap.get(row.documentId) ?? null) : null;
      const newId = (await this.table('tests').add({
        createdAt: row.createdAt,
        documentId,
        lang: row.lang,
        examBoard: row.examBoard,
        grossWpm: row.grossWpm,
        netWpm: row.netWpm,
        accuracy: row.accuracy,
        errors: row.errors,
        durationSec: row.durationSec,
        status: row.status,
      } as TestRecord)) as number;
      testIdMap.set(row.id, newId);
    }

    for (const r of t.results ?? []) {
      const testId = testIdMap.get(r.testId);
      if (testId == null) continue;
      await this.table('results').put({ ...r, testId } as ResultRecord);
    }
    for (const m of t.mistakes ?? []) {
      const testId = testIdMap.get(m.testId);
      if (testId == null) continue;
      await this.table('mistakes').add({
        testId,
        category: m.category,
        expected: m.expected,
        typed: m.typed,
        index: m.index,
      } as MistakeRecord);
    }
    for (const tl of t.timeline ?? []) {
      const testId = testIdMap.get(tl.testId);
      if (testId == null) continue;
      await this.table('timeline').add({
        testId,
        bucket: tl.bucket,
        wpm: tl.wpm,
        accuracy: tl.accuracy,
      } as TimelineRecord);
    }
    for (const k of t.keystrokes ?? []) {
      const testId = testIdMap.get(k.testId);
      if (testId == null) continue;
      await this.table('keystrokes').put({ testId, keystrokes: k.keystrokes });
    }
    for (const s of t.settings ?? []) {
      await this.table('settings').put(s);
    }
  }
}
