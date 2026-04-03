import { db } from './database';
import { createDefaultLabels } from '@/constants/labels';

export async function seedDefaults(): Promise<void> {
  const labelCount = await db.labels.count();
  if (labelCount === 0) {
    const labels = createDefaultLabels();
    await db.labels.bulkAdd(labels);
  }
}
