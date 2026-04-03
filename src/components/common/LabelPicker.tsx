import { useMemo } from 'react';
import { useLabelStore } from '@/stores/labelStore';
import type { LabelType } from '@/types';
import { DynamicIcon } from './DynamicIcon';
import { Check } from 'lucide-react';

interface LabelPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  filterType?: LabelType | 'all';
}

export function LabelPicker({ selectedIds, onChange, filterType = 'all' }: LabelPickerProps) {
  const allLabels = useLabelStore((s) => s.labels);
  const labels = useMemo(() => {
    if (filterType === 'all') return allLabels;
    return allLabels.filter((l) => l.type === filterType || l.type === 'both');
  }, [allLabels, filterType]);

  const toggleLabel = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((lid) => lid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => {
        const isSelected = selectedIds.includes(label.id);
        return (
          <button
            key={label.id}
            type="button"
            onClick={() => toggleLabel(label.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isSelected
                ? 'text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            style={isSelected ? { backgroundColor: label.color } : undefined}
          >
            <DynamicIcon name={label.icon} size={14} />
            {label.name}
            {isSelected && <Check size={14} />}
          </button>
        );
      })}
    </div>
  );
}
