import Dexie, { type Table } from 'dexie';

export interface DBStore {
  id: string;
  storeName: string;
  state: Record<string, any>;
  timestamp: number;
}

export class ACSDatabase extends Dexie {
  stores!: Table<DBStore>;

  constructor() {
    super('ACSDatabase');
    this.version(1).stores({
      stores: '&id'
    });
  }
}

export const db = new ACSDatabase();