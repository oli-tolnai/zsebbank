import { addMonths, addYears, parseISO, isBefore, isToday, differenceInDays, startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import type { Frequency } from '@/types';

export function getNextDueDate(current: string, frequency: Frequency): string {
  const date = parseISO(current);
  let next: Date;
  switch (frequency) {
    case 'monthly':
      next = addMonths(date, 1);
      break;
    case 'bimonthly':
      next = addMonths(date, 2);
      break;
    case 'quarterly':
      next = addMonths(date, 3);
      break;
    case 'yearly':
      next = addYears(date, 1);
      break;
  }
  return format(next, 'yyyy-MM-dd');
}

export function isPastOrToday(dateStr: string): boolean {
  const date = parseISO(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return isBefore(date, today) || isToday(date);
}

export function getDaysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date());
}

export function isWithinDays(dateStr: string, days: number): boolean {
  const diff = getDaysUntil(dateStr);
  return diff >= 0 && diff <= days;
}

export function getMonthRange(monthStr: string): { start: string; end: string } {
  const date = parseISO(`${monthStr}-01`);
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  };
}

export function getPreviousMonths(count: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    months.push(format(subMonths(now, i), 'yyyy-MM'));
  }
  return months;
}
