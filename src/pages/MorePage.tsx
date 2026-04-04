import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Strings } from '@/constants/strings';
import { History, RefreshCw, BarChart3, Settings, HandCoins, ChevronRight } from 'lucide-react';

const menuItems = [
  { icon: History, label: Strings.transaction.history, path: '/history' },
  { icon: RefreshCw, label: Strings.recurring.title, path: '/recurring' },
  { icon: HandCoins, label: Strings.debt.title, path: '/debts' },
  { icon: BarChart3, label: Strings.statistics.title, path: '/statistics' },
  { icon: Settings, label: Strings.settings.title, path: '/settings' },
];

export function MorePage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title={Strings.tabs.more} />
      <div className="px-4 py-4">
        <Card padding={false}>
          {menuItems.map((item, i) => (
            <button
              key={item.path}
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
      </div>
    </div>
  );
}
