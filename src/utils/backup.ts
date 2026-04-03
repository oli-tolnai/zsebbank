import { db } from '@/db/database';
import type { ZsebbankBackup } from '@/types';

export async function exportBackup(): Promise<ZsebbankBackup> {
  const [accounts, labels, transactions, recurringTransactions, piggyBanks, piggyTransactions, settings] =
    await Promise.all([
      db.accounts.toArray(),
      db.labels.toArray(),
      db.transactions.toArray(),
      db.recurringTransactions.toArray(),
      db.piggyBanks.toArray(),
      db.piggyTransactions.toArray(),
      db.settings.toArray(),
    ]);

  return {
    meta: {
      version: 1,
      appVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      tableCounts: {
        accounts: accounts.length,
        labels: labels.length,
        transactions: transactions.length,
        recurringTransactions: recurringTransactions.length,
        piggyBanks: piggyBanks.length,
        piggyTransactions: piggyTransactions.length,
        settings: settings.length,
      },
    },
    data: {
      accounts,
      labels,
      transactions,
      recurringTransactions,
      piggyBanks,
      piggyTransactions,
      settings,
    },
  };
}

export async function importBackup(backup: ZsebbankBackup): Promise<void> {
  if (!backup.meta || backup.meta.version !== 1) {
    throw new Error('Nem támogatott mentésverzió.');
  }
  if (!backup.data) {
    throw new Error('Hiányos mentésfájl.');
  }

  await db.transaction(
    'rw',
    [db.accounts, db.labels, db.transactions, db.recurringTransactions, db.piggyBanks, db.piggyTransactions, db.settings],
    async () => {
      // Clear all tables
      await db.piggyTransactions.clear();
      await db.piggyBanks.clear();
      await db.transactions.clear();
      await db.recurringTransactions.clear();
      await db.labels.clear();
      await db.accounts.clear();
      await db.settings.clear();

      // Bulk insert all data
      if (backup.data.accounts?.length) await db.accounts.bulkAdd(backup.data.accounts);
      if (backup.data.labels?.length) await db.labels.bulkAdd(backup.data.labels);
      if (backup.data.transactions?.length) await db.transactions.bulkAdd(backup.data.transactions);
      if (backup.data.recurringTransactions?.length) await db.recurringTransactions.bulkAdd(backup.data.recurringTransactions);
      if (backup.data.piggyBanks?.length) await db.piggyBanks.bulkAdd(backup.data.piggyBanks);
      if (backup.data.piggyTransactions?.length) await db.piggyTransactions.bulkAdd(backup.data.piggyTransactions);
      if (backup.data.settings?.length) await db.settings.bulkAdd(backup.data.settings);
    }
  );
}
