import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { DynamicIcon } from '@/components/common/DynamicIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { Strings } from '@/constants/strings';
import { formatHuf, formatMonth, getCurrentMonth } from '@/utils/format';
import { getMonthRange, getPreviousMonths } from '@/utils/date';
import { db } from '@/db/database';
import { useLabelStore } from '@/stores/labelStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import type { MonthlyStats, LabelStats } from '@/types';

type Tab = 'monthly' | 'labels' | 'trend';

export function StatisticsPage() {
  const [tab, setTab] = useState<Tab>('monthly');
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [monthStats, setMonthStats] = useState<MonthlyStats>({ month: '', income: 0, expense: 0 });
  const [labelStats, setLabelStats] = useState<LabelStats[]>([]);
  const [trendData, setTrendData] = useState<MonthlyStats[]>([]);
  const getLabel = useLabelStore((s) => s.getLabel);
  useLabelStore((s) => s.labels); // subscribe to label changes

  useEffect(() => {
    const { start, end } = getMonthRange(currentMonth);
    db.transactions.where('date').between(start, end, true, true).toArray().then((txs) => {
      const income = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      setMonthStats({ month: currentMonth, income, expense });

      // Label breakdown for expenses
      const labelMap = new Map<string, number>();
      const expenseTxs = txs.filter((t) => t.type === 'expense');
      const totalExpense = expense;
      for (const tx of expenseTxs) {
        for (const lid of tx.labelIds) {
          labelMap.set(lid, (labelMap.get(lid) ?? 0) + tx.amount);
        }
        if (tx.labelIds.length === 0) {
          labelMap.set('__none', (labelMap.get('__none') ?? 0) + tx.amount);
        }
      }

      const stats: LabelStats[] = Array.from(labelMap.entries())
        .map(([labelId, total]) => {
          const label = getLabel(labelId);
          return {
            labelId,
            labelName: label?.name ?? 'Egyéb',
            labelIcon: label?.icon ?? 'MoreHorizontal',
            labelColor: label?.color ?? '#94a3b8',
            total,
            percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0,
          };
        })
        .sort((a, b) => b.total - a.total);
      setLabelStats(stats);
    });
  }, [currentMonth, getLabel]);

  useEffect(() => {
    const months = getPreviousMonths(6).reverse();
    Promise.all(
      months.map(async (m) => {
        const { start, end } = getMonthRange(m);
        const txs = await db.transactions.where('date').between(start, end, true, true).toArray();
        return {
          month: m,
          income: txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
          expense: txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
        };
      })
    ).then(setTrendData);
  }, []);

  const prevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m - 2);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const nextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const d = new Date(y, m);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div>
      <PageHeader title={Strings.statistics.title} showBack />
      <div className="px-4 py-4 space-y-4">
        <SegmentedControl
          options={[
            { value: 'monthly' as Tab, label: Strings.statistics.monthlyOverview },
            { value: 'labels' as Tab, label: Strings.statistics.byLabel },
            { value: 'trend' as Tab, label: Strings.statistics.trend },
          ]}
          value={tab}
          onChange={setTab}
        />

        {/* Month Selector */}
        {(tab === 'monthly' || tab === 'labels') && (
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeft size={20} /></button>
            <span className="font-medium">{formatMonth(currentMonth)}</span>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100"><ChevronRight size={20} /></button>
          </div>
        )}

        {tab === 'monthly' && (
          <Card>
            {monthStats.income === 0 && monthStats.expense === 0 ? (
              <EmptyState icon={<BarChart3 size={32} />} title={Strings.statistics.noData} />
            ) : (
              <>
                <div className="h-48">
                  <ResponsiveContainer>
                    <BarChart data={[monthStats]} barGap={8}>
                      <XAxis dataKey="month" hide />
                      <YAxis hide />
                      <Tooltip formatter={(v) => formatHuf(Number(v))} />
                      <Bar dataKey="income" fill="#22c55e" radius={[8, 8, 0, 0]} name="Bevétel" />
                      <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} name="Kiadás" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{Strings.dashboard.monthlyIncome}</p>
                    <p className="font-semibold text-income text-sm">{formatHuf(monthStats.income)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{Strings.dashboard.monthlyExpense}</p>
                    <p className="font-semibold text-expense text-sm">{formatHuf(monthStats.expense)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{Strings.statistics.difference}</p>
                    <p className={`font-semibold text-sm ${monthStats.income - monthStats.expense >= 0 ? 'text-income' : 'text-expense'}`}>
                      {formatHuf(monthStats.income - monthStats.expense)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </Card>
        )}

        {tab === 'labels' && (
          <Card>
            {labelStats.length === 0 ? (
              <EmptyState icon={<BarChart3 size={32} />} title={Strings.statistics.noData} />
            ) : (
              <>
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={labelStats} dataKey="total" nameKey="labelName" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                        {labelStats.map((s) => <Cell key={s.labelId} fill={s.labelColor} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatHuf(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {labelStats.map((s) => (
                    <div key={s.labelId} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${s.labelColor}20`, color: s.labelColor }}>
                        <DynamicIcon name={s.labelIcon} size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.labelName}</p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">{formatHuf(s.total)}</p>
                      <p className="text-xs text-slate-500 w-10 text-right">{s.percentage}%</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        )}

        {tab === 'trend' && (
          <Card>
            {trendData.every((d) => d.income === 0 && d.expense === 0) ? (
              <EmptyState icon={<BarChart3 size={32} />} title={Strings.statistics.noData} />
            ) : (
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={trendData}>
                    <XAxis dataKey="month" tickFormatter={(m) => m.split('-')[1]} tick={{ fontSize: 12 }} />
                    <YAxis hide />
                    <Tooltip formatter={(v) => formatHuf(Number(v))} labelFormatter={(m) => formatMonth(m)} />
                    <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} dot name="Bevétel" />
                    <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot name="Kiadás" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
