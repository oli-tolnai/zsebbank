import { format, parseISO } from 'date-fns';
import { hu } from 'date-fns/locale';

const numberFormatter = new Intl.NumberFormat('hu-HU');

export function formatAmount(amount: number): string {
  return numberFormatter.format(amount);
}

export function formatHuf(amount: number): string {
  return `${formatAmount(amount)} Ft`;
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy. MMMM d.', { locale: hu });
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'MM. dd.', { locale: hu });
}

export function formatMonth(monthStr: string): string {
  return format(parseISO(`${monthStr}-01`), 'yyyy. MMMM', { locale: hu });
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export interface DateGroup<T> {
  date: string;
  formattedDate: string;
  items: T[];
}

export function groupByDate<T extends { date: string }>(items: T[]): DateGroup<T>[] {
  const groups: Map<string, T[]> = new Map();
  for (const item of items) {
    const existing = groups.get(item.date);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(item.date, [item]);
    }
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, groupItems]) => ({
      date,
      formattedDate: formatDate(date),
      items: groupItems,
    }));
}
