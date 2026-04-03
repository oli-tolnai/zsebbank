import Dexie, { type EntityTable } from 'dexie';
import type {
  Account,
  Label,
  Transaction,
  RecurringTransaction,
  PiggyBank,
  PiggyTransaction,
  Setting,
} from '@/types';

export class ZsebbankDB extends Dexie {
  accounts!: EntityTable<Account, 'id'>;
  labels!: EntityTable<Label, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  recurringTransactions!: EntityTable<RecurringTransaction, 'id'>;
  piggyBanks!: EntityTable<PiggyBank, 'id'>;
  piggyTransactions!: EntityTable<PiggyTransaction, 'id'>;
  settings!: EntityTable<Setting, 'key'>;

  constructor() {
    super('zsebbank');

    this.version(1).stores({
      accounts: 'id, type, order',
      labels: 'id, type, name',
      transactions: 'id, type, accountId, toAccountId, date, recurringId, *labelIds',
      recurringTransactions: 'id, type, accountId, nextDueDate, isActive',
      piggyBanks: 'id, linkedAccountId',
      piggyTransactions: 'id, piggyBankId, accountId, date',
      settings: 'key',
    });
  }
}

export const db = new ZsebbankDB();
