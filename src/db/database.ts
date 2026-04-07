import Dexie, { type EntityTable } from 'dexie';
import type {
  Account,
  Label,
  Transaction,
  RecurringTransaction,
  PiggyBank,
  PiggyTransaction,
  Debt,
  Setting,
} from '@/types';

export class ZsebbankDB extends Dexie {
  accounts!: EntityTable<Account, 'id'>;
  labels!: EntityTable<Label, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  recurringTransactions!: EntityTable<RecurringTransaction, 'id'>;
  piggyBanks!: EntityTable<PiggyBank, 'id'>;
  piggyTransactions!: EntityTable<PiggyTransaction, 'id'>;
  debts!: EntityTable<Debt, 'id'>;
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

    this.version(2).stores({
      debts: 'id, direction, status, personName, date',
    });

    this.version(3).stores({
      piggyBanks: 'id, linkedAccountId, type',
    }).upgrade(tx => {
      return tx.table('piggyBanks').toCollection().modify(piggy => {
        if (!piggy.type) piggy.type = 'bank';
      });
    });
  }
}

export const db = new ZsebbankDB();
