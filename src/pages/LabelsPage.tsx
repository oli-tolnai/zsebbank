import { useState } from 'react';
import { useLabelStore } from '@/stores/labelStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Strings } from '@/constants/strings';
import { LabelColors } from '@/constants/colors';
import { showToast } from '@/components/ui/Toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Label, LabelType } from '@/types';

const iconOptions = ['ShoppingCart', 'Car', 'Home', 'Zap', 'Smartphone', 'Heart', 'Gamepad2', 'UtensilsCrossed', 'Shirt', 'Gift', 'GraduationCap', 'Plane', 'Wrench', 'CreditCard', 'Banknote', 'Briefcase', 'Trophy', 'MoreHorizontal'];

export function LabelsPage() {
  const { labels, addLabel, updateLabel, deleteLabel } = useLabelStore();
  const [editLabel, setEditLabel] = useState<Label | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<LabelType>('expense');
  const [icon, setIcon] = useState('MoreHorizontal');
  const [color, setColor] = useState<string>(LabelColors[0]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setIsNew(true);
    setEditLabel(null);
    setName('');
    setType('expense');
    setIcon('MoreHorizontal');
    setColor(LabelColors[0]);
  };

  const openEdit = (label: Label) => {
    setIsNew(false);
    setEditLabel(label);
    setName(label.name);
    setType(label.type);
    setIcon(label.icon);
    setColor(label.color);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      if (isNew) {
        await addLabel({ name: name.trim(), type, icon, color });
        showToast('success', 'Címke létrehozva!');
      } else if (editLabel) {
        await updateLabel(editLabel.id, { name: name.trim(), type, icon, color });
        showToast('success', 'Címke módosítva!');
      }
      setEditLabel(null);
      setIsNew(false);
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteLabel(deleteId);
    setDeleteId(null);
    showToast('success', 'Címke törölve!');
  };

  const expenseLabels = labels.filter((l) => l.type === 'expense');
  const incomeLabels = labels.filter((l) => l.type === 'income');
  const bothLabels = labels.filter((l) => l.type === 'both');

  return (
    <div>
      <PageHeader
        title={Strings.settings.labels}
        showBack
        right={<button onClick={openNew} className="p-2 rounded-full hover:bg-slate-100"><Plus size={22} className="text-primary" /></button>}
      />
      <div className="px-4 py-4 space-y-4">
        {[
          { title: 'Kiadás', items: expenseLabels },
          { title: 'Bevétel', items: incomeLabels },
          { title: 'Mindkettő', items: bothLabels },
        ].map(({ title, items }) =>
          items.length > 0 ? (
            <div key={title}>
              <h3 className="text-sm font-medium text-slate-500 mb-2">{title}</h3>
              <Card padding={false}>
                {items.map((label, i) => (
                  <div key={label.id} className={`flex items-center gap-3 px-4 py-3 ${i < items.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${label.color}20`, color: label.color }}>
                      <DynamicIcon name={label.icon} size={16} />
                    </div>
                    <span className="flex-1 text-sm font-medium">{label.name}</span>
                    <button onClick={() => openEdit(label)} className="p-1.5 rounded-full hover:bg-slate-100"><Edit size={16} className="text-slate-400" /></button>
                    <button onClick={() => setDeleteId(label.id)} className="p-1.5 rounded-full hover:bg-slate-100"><Trash2 size={16} className="text-slate-400" /></button>
                  </div>
                ))}
              </Card>
            </div>
          ) : null
        )}
      </div>

      <Modal isOpen={isNew || editLabel !== null} onClose={() => { setIsNew(false); setEditLabel(null); }} title={isNew ? 'Új címke' : 'Címke szerkesztése'}>
        <div className="p-4 space-y-4">
          <Input label="Név" value={name} onChange={(e) => setName(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Típus</label>
            <SegmentedControl options={[{ value: 'expense' as LabelType, label: 'Kiadás' }, { value: 'income' as LabelType, label: 'Bevétel' }, { value: 'both' as LabelType, label: 'Mindkettő' }]} value={type} onChange={setType} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Ikon</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((ic) => (
                <button key={ic} type="button" onClick={() => setIcon(ic)} className={`w-9 h-9 rounded-lg flex items-center justify-center ${icon === ic ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <DynamicIcon name={ic} size={16} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Szín</label>
            <div className="flex flex-wrap gap-2">
              {LabelColors.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={`w-7 h-7 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <Button fullWidth onClick={handleSave}>{Strings.common.save}</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Címke törlése" message="Biztosan törölni szeretnéd ezt a címkét?" />
    </div>
  );
}
