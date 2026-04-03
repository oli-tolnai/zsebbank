import type { Label } from '@/types';
import { generateId } from '@/utils/id';

export const defaultLabels: Omit<Label, 'id' | 'createdAt'>[] = [
  { name: 'Élelmiszer', type: 'expense', icon: 'ShoppingCart', color: '#22c55e', isDefault: true },
  { name: 'Közlekedés', type: 'expense', icon: 'Car', color: '#3b82f6', isDefault: true },
  { name: 'Lakhatás', type: 'expense', icon: 'Home', color: '#8b5cf6', isDefault: true },
  { name: 'Rezsi', type: 'expense', icon: 'Zap', color: '#f59e0b', isDefault: true },
  { name: 'Telefon/Internet', type: 'expense', icon: 'Smartphone', color: '#06b6d4', isDefault: true },
  { name: 'Egészség', type: 'expense', icon: 'Heart', color: '#ef4444', isDefault: true },
  { name: 'Szórakozás', type: 'expense', icon: 'Gamepad2', color: '#ec4899', isDefault: true },
  { name: 'Étterem', type: 'expense', icon: 'UtensilsCrossed', color: '#f97316', isDefault: true },
  { name: 'Ruházat', type: 'expense', icon: 'Shirt', color: '#a855f7', isDefault: true },
  { name: 'Ajándék', type: 'expense', icon: 'Gift', color: '#f43f5e', isDefault: true },
  { name: 'Oktatás', type: 'expense', icon: 'GraduationCap', color: '#0ea5e9', isDefault: true },
  { name: 'Utazás', type: 'expense', icon: 'Plane', color: '#14b8a6', isDefault: true },
  { name: 'Háztartás', type: 'expense', icon: 'Wrench', color: '#64748b', isDefault: true },
  { name: 'Előfizetés', type: 'expense', icon: 'CreditCard', color: '#6366f1', isDefault: true },
  { name: 'Fizetés', type: 'income', icon: 'Banknote', color: '#22c55e', isDefault: true },
  { name: 'Mellékállás', type: 'income', icon: 'Briefcase', color: '#3b82f6', isDefault: true },
  { name: 'Jutalom', type: 'income', icon: 'Trophy', color: '#f59e0b', isDefault: true },
  { name: 'Egyéb', type: 'both', icon: 'MoreHorizontal', color: '#94a3b8', isDefault: true },
];

export function createDefaultLabels(): Label[] {
  const now = new Date().toISOString();
  return defaultLabels.map((label) => ({
    ...label,
    id: generateId(),
    createdAt: now,
  }));
}
