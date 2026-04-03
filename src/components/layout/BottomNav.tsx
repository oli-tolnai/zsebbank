import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, PlusCircle, PiggyBank, Menu } from 'lucide-react';
import { Strings } from '@/constants/strings';

const tabs = [
  { path: '/dashboard', label: Strings.tabs.overview, icon: LayoutDashboard },
  { path: '/accounts', label: Strings.tabs.accounts, icon: Wallet },
  { path: '/transaction/new', label: Strings.tabs.newTransaction, icon: PlusCircle, isCenter: true },
  { path: '/piggy', label: Strings.tabs.piggyBanks, icon: PiggyBank },
  { path: '/more', label: Strings.tabs.more, icon: Menu },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-40">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 min-w-[60px] ${
                tab.isCenter
                  ? ''
                  : isActive
                    ? 'text-primary'
                    : 'text-slate-400'
              }`
            }
          >
            {tab.isCenter ? (
              <div className="bg-primary text-white rounded-full p-2.5 -mt-4 shadow-lg shadow-primary/30">
                <tab.icon size={24} />
              </div>
            ) : (
              <>
                <tab.icon size={22} />
                <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
