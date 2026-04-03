import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Strings } from '@/constants/strings';
import { Lock, Tag, Download, Upload, Info, ChevronRight } from 'lucide-react';

const menuItems = [
  { icon: Lock, label: Strings.settings.pin, path: '/settings/pin' },
  { icon: Tag, label: Strings.settings.labels, path: '/settings/labels' },
  { icon: Download, label: Strings.settings.export, path: '/settings/export', id: 'export' },
  { icon: Upload, label: Strings.settings.import, path: '/settings/export', id: 'import' },
  { icon: Info, label: Strings.settings.about, path: '/settings/about' },
];

export function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title={Strings.settings.title} showBack />
      <div className="px-4 py-4">
        <Card padding={false}>
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left ${
                i < menuItems.length - 1 ? 'border-b border-slate-50' : ''
              }`}
            >
              <item.icon size={20} className="text-slate-500" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}
        </Card>

        <div className="text-center mt-8">
          <p className="text-xs text-slate-400">{Strings.app.name} v{Strings.app.version}</p>
        </div>
      </div>
    </div>
  );
}
