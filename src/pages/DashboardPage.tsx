import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccountStore } from '@/stores/accountStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useRecurringStore } from '@/stores/recurringStore';
import { usePiggyStore } from '@/stores/piggyStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { TransactionRow } from '@/components/common/TransactionRow';
import { AmountDisplay } from '@/components/common/AmountDisplay';
import { ProgressBar } from '@/components/common/ProgressBar';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Strings } from '@/constants/strings';
import { formatHuf, getCurrentMonth } from '@/utils/format';
import { getDaysUntil } from '@/utils/date';
import { Wallet, TrendingUp, TrendingDown, ChevronRight, LayoutDashboard } from 'lucide-react';
import { db } from '@/db/database';
import type { MonthlyStats } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const accounts = useAccountStore((s) => s.accounts);
  const totalBalance = useAccountStore((s) => s.totalBalance);
  const cashBalance = useAccountStore((s) => s.cashBalance);
  const bankBalance = useAccountStore((s) => s.bankBalance);
  const transactions = useTransactionStore((s) => s.transactions);
  const upcoming = useRecurringStore((s) => s.getUpcoming(7));
  const piggyBanks = usePiggyStore((s) => s.piggyBanks);
  const [monthStats, setMonthStats] = useState<MonthlyStats>({ month: '', income: 0, expense: 0 });

  useEffect(() => {
    const currentMonth = getCurrentMonth();
    const startDate = `${currentMonth}-01`;
    const endDate = `${currentMonth}-31`;
    db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray()
      .then((txs) => {
        const income = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        setMonthStats({ month: currentMonth, income, expense });
      });
  }, [transactions]);

  if (accounts.length === 0) {
    return (
      <div>
        <PageHeader title={Strings.dashboard.title} />
        <EmptyState
          icon={<Wallet size={48} />}
          title={Strings.dashboard.noAccounts}
          actionLabel={Strings.account.addNew}
          onAction={() => navigate('/accounts/new')}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={Strings.dashboard.title} />
      <div className="px-4 py-4 space-y-4">
        {/* Total Balance */}
        <Card className="bg-gradient-to-br from-primary to-primary-dark text-white !border-0">
          <p className="text-blue-100 text-sm">{Strings.dashboard.totalBalance}</p>
          <p className="text-3xl font-bold mt-1 tabular-nums">{formatHuf(totalBalance())}</p>
          <div className="flex gap-4 mt-3 text-blue-100 text-sm">
            <span>{Strings.dashboard.cash}: {formatHuf(cashBalance())}</span>
            <span>{Strings.dashboard.digital}: {formatHuf(bankBalance())}</span>
          </div>
        </Card>

        {/* Accounts Quick View */}
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => navigate(`/accounts/${account.id}`)}
              className="flex-none bg-white rounded-xl p-3 border border-slate-100 shadow-sm min-w-[130px]"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white mb-2" style={{ backgroundColor: account.color }}>
                <DynamicIcon name={account.icon} size={16} />
              </div>
              <p className="text-xs text-slate-500 truncate">{account.name}</p>
              <p className="text-sm font-semibold tabular-nums">{formatHuf(account.balance)}</p>
            </button>
          ))}
        </div>

        {/* Monthly Summary */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">{Strings.dashboard.monthlySummary}</h3>
            <button onClick={() => navigate('/statistics')} className="text-primary text-sm font-medium">{Strings.dashboard.showAll}</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-income-light/50 rounded-xl p-3">
              <TrendingUp size={16} className="text-income mb-1" />
              <p className="text-[10px] text-slate-500">{Strings.dashboard.monthlyIncome}</p>
              <p className="text-sm font-semibold text-income tabular-nums">{formatHuf(monthStats.income)}</p>
            </div>
            <div className="bg-expense-light/50 rounded-xl p-3">
              <TrendingDown size={16} className="text-expense mb-1" />
              <p className="text-[10px] text-slate-500">{Strings.dashboard.monthlyExpense}</p>
              <p className="text-sm font-semibold text-expense tabular-nums">{formatHuf(monthStats.expense)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <Wallet size={16} className="text-slate-500 mb-1" />
              <p className="text-[10px] text-slate-500">{Strings.statistics.difference}</p>
              <p className={`text-sm font-semibold tabular-nums ${monthStats.income - monthStats.expense >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatHuf(monthStats.income - monthStats.expense)}
              </p>
            </div>
          </div>
        </Card>

        {/* Upcoming Recurring */}
        {upcoming.length > 0 && (
          <Card padding={false}>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="font-semibold text-slate-900">{Strings.dashboard.upcomingRecurring}</h3>
              <button onClick={() => navigate('/recurring')} className="text-primary text-sm font-medium">{Strings.dashboard.showAll}</button>
            </div>
            {upcoming.slice(0, 3).map((rec) => (
              <div key={rec.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-900">{rec.name}</p>
                  <p className="text-xs text-slate-500">{getDaysUntil(rec.nextDueDate)} nap múlva</p>
                </div>
                <AmountDisplay amount={rec.amount} type={rec.type} size="sm" />
              </div>
            ))}
          </Card>
        )}

        {/* Recent Transactions */}
        <Card padding={false}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="font-semibold text-slate-900">{Strings.dashboard.recentTransactions}</h3>
            <button onClick={() => navigate('/history')} className="text-primary text-sm font-medium flex items-center gap-1">
              {Strings.dashboard.showAll} <ChevronRight size={14} />
            </button>
          </div>
          {transactions.length === 0 ? (
            <EmptyState
              icon={<LayoutDashboard size={32} />}
              title={Strings.dashboard.noTransactions}
            />
          ) : (
            <div className="divide-y divide-slate-50">
              {transactions.slice(0, 5).map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </Card>

        {/* Piggy Banks Summary */}
        {piggyBanks.length > 0 && (
          <Card padding={false}>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h3 className="font-semibold text-slate-900">{Strings.piggy.title}</h3>
              <button onClick={() => navigate('/piggy')} className="text-primary text-sm font-medium">{Strings.dashboard.showAll}</button>
            </div>
            <div className="px-4 pb-4 space-y-3">
              {piggyBanks.slice(0, 3).map((piggy) => (
                <button key={piggy.id} onClick={() => navigate(`/piggy/${piggy.id}`)} className="w-full text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{piggy.name}</span>
                    <span className="text-xs text-slate-500">
                      {formatHuf(piggy.currentAmount)}
                      {piggy.targetAmount > 0 && ` / ${formatHuf(piggy.targetAmount)}`}
                    </span>
                  </div>
                  {piggy.targetAmount > 0 && (
                    <ProgressBar current={piggy.currentAmount} target={piggy.targetAmount} color={piggy.color} />
                  )}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
