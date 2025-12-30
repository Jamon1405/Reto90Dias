import Dexie, { Table } from 'dexie';
import type { TitanDay, TitanState } from './types';

class TitanOmegaDB extends Dexie {
  days!: Table<TitanDay, string>;
  state!: Table<TitanState, string>;

  constructor() {
    super('titanOmega');
    this.version(2).stores({
      days: 'date',
      state: 'key',
    });
  }
}

export const db = new TitanOmegaDB();
