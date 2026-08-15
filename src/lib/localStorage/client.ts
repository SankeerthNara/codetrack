/**
 * Local-storage backed data client.
 *
 * CodeTrack has no login flow — `platform_connections` used to be one shared,
 * public Supabase table, which meant every visitor saw (and could overwrite)
 * everyone else's connected usernames and stats. This client keeps the exact
 * same chainable query shape as the Supabase JS client
 * (`.from(table).select().eq().single()`, `.upsert()`, `.update().eq()`,
 * `.delete().eq()`) but reads/writes the browser's own `window.localStorage`
 * instead of the network. Swapping the import is enough to make stats
 * personal to each browser — no server, no account, no shared state.
 *
 * Only the operations CodeTrack actually uses are implemented; this is not a
 * general Supabase shim.
 */

const STORAGE_PREFIX = 'codetrack_';

type Row = Record<string, any>;

function storageKey(table: string) {
  return `${STORAGE_PREFIX}${table}`;
}

function readTable(table: string): Row[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey(table));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt JSON or storage unavailable (private browsing, disabled, etc.)
    return [];
  }
}

function writeTable(table: string, rows: Row[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(table), JSON.stringify(rows));
  } catch {
    // Quota exceeded or storage unavailable — fail silently, same as a
    // dropped network request would from the caller's point of view.
  }
}

function pickColumns(row: Row, columns: string): Row {
  const trimmed = columns.trim();
  if (!trimmed || trimmed === '*') return { ...row };
  const fields = trimmed.split(',').map((c) => c.trim());
  const out: Row = {};
  fields.forEach((field) => {
    out[field] = row[field];
  });
  return out;
}

type QueryResult<T = any> = { data: T; error: { message: string } | null };

class LocalQueryBuilder implements PromiseLike<QueryResult> {
  private readonly table: string;
  private op: 'select' | 'upsert' | 'update' | 'delete' = 'select';
  private columns = '*';
  private readonly filters: Array<[string, any]> = [];
  private payload: Row | null = null;
  private conflictColumn: string | null = null;
  private singleRow = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = '*') {
    this.op = 'select';
    this.columns = columns;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push([column, value]);
    return this;
  }

  upsert(payload: Row, options?: { onConflict?: string }) {
    this.op = 'upsert';
    this.payload = payload;
    this.conflictColumn = options?.onConflict ?? null;
    return this.run();
  }

  update(payload: Row) {
    this.op = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  single() {
    this.singleRow = true;
    return this.run();
  }

  // Makes `await builder` work even without an explicit terminal call
  // (e.g. `await supabase.from(t).delete().eq('platform', p)`), mirroring
  // how the real Supabase query builder is thenable.
  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled, onrejected);
  }

  private matches(row: Row) {
    return this.filters.every(([column, value]) => row[column] === value);
  }

  private async run(): Promise<QueryResult> {
    try {
      const rows = readTable(this.table);

      if (this.op === 'select') {
        const matched = rows.filter((row) => this.matches(row));
        const shaped = matched.map((row) => pickColumns(row, this.columns));
        if (this.singleRow) {
          if (shaped.length === 0) {
            return { data: null, error: { message: 'No rows found' } };
          }
          return { data: shaped[0], error: null };
        }
        return { data: shaped, error: null };
      }

      if (this.op === 'upsert' && this.payload) {
        const conflictColumn = this.conflictColumn ?? 'id';
        const conflictValue = this.payload[conflictColumn];
        const idx = rows.findIndex((row) => row[conflictColumn] === conflictValue);
        if (idx >= 0) {
          rows[idx] = { ...rows[idx], ...this.payload };
        } else {
          rows.push({ ...this.payload });
        }
        writeTable(this.table, rows);
        return { data: this.payload, error: null };
      }

      if (this.op === 'update' && this.payload) {
        const updated = rows.map((row) =>
          this.matches(row) ? { ...row, ...this.payload } : row
        );
        writeTable(this.table, updated);
        return { data: null, error: null };
      }

      if (this.op === 'delete') {
        const remaining = rows.filter((row) => !this.matches(row));
        writeTable(this.table, remaining);
        return { data: null, error: null };
      }

      return { data: this.singleRow ? null : [], error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Local storage error';
      return { data: null, error: { message } };
    }
  }
}

export function createClient() {
  return {
    from(table: string) {
      return new LocalQueryBuilder(table);
    },
  };
}
