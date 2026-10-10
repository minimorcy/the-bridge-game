export interface GameRecord {
  drinks: number;
  name: string;
  date: string;
}

const KEY = 'el-puente:record';

export function isNewRecord(record: GameRecord | null, drinks: number): boolean {
  return record === null || drinks < record.drinks;
}

export function loadRecord(storage: Pick<Storage, 'getItem'> | null = safeStorage()): GameRecord | null {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as GameRecord;
    return typeof r.drinks === 'number' && typeof r.name === 'string' ? r : null;
  } catch {
    return null;
  }
}

/** Guarda el récord si mejora el actual; devuelve si es nuevo. */
export function submitRecord(
  drinks: number,
  name: string,
  date = new Date().toISOString().slice(0, 10),
  storage: Pick<Storage, 'getItem' | 'setItem'> | null = safeStorage(),
): boolean {
  if (!isNewRecord(loadRecord(storage), drinks)) return false;
  try {
    storage?.setItem(KEY, JSON.stringify({ drinks, name, date }));
  } catch {
    /* sin almacenamiento: el récord no se guarda */
  }
  return true;
}

export function safeStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
