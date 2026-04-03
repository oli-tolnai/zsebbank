import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { AccountsPage } from '@/pages/AccountsPage';
import { AccountDetailPage } from '@/pages/AccountDetailPage';
import { AccountFormPage } from '@/pages/AccountFormPage';
import { TransactionFormPage } from '@/pages/TransactionFormPage';
import { TransactionDetailPage } from '@/pages/TransactionDetailPage';
import { TransactionHistoryPage } from '@/pages/TransactionHistoryPage';
import { RecurringPage } from '@/pages/RecurringPage';
import { RecurringFormPage } from '@/pages/RecurringFormPage';
import { PiggyBanksPage } from '@/pages/PiggyBanksPage';
import { PiggyDetailPage } from '@/pages/PiggyDetailPage';
import { PiggyFormPage } from '@/pages/PiggyFormPage';
import { StatisticsPage } from '@/pages/StatisticsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { PinSettingsPage } from '@/pages/PinSettingsPage';
import { LabelsPage } from '@/pages/LabelsPage';
import { ExportImportPage } from '@/pages/ExportImportPage';
import { MorePage } from '@/pages/MorePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'accounts/new', element: <AccountFormPage /> },
      { path: 'accounts/:id', element: <AccountDetailPage /> },
      { path: 'accounts/:id/edit', element: <AccountFormPage /> },
      { path: 'transaction/new', element: <TransactionFormPage /> },
      { path: 'transaction/:id', element: <TransactionDetailPage /> },
      { path: 'transaction/:id/edit', element: <TransactionFormPage /> },
      { path: 'history', element: <TransactionHistoryPage /> },
      { path: 'recurring', element: <RecurringPage /> },
      { path: 'recurring/new', element: <RecurringFormPage /> },
      { path: 'recurring/:id/edit', element: <RecurringFormPage /> },
      { path: 'piggy', element: <PiggyBanksPage /> },
      { path: 'piggy/new', element: <PiggyFormPage /> },
      { path: 'piggy/:id', element: <PiggyDetailPage /> },
      { path: 'piggy/:id/edit', element: <PiggyFormPage /> },
      { path: 'statistics', element: <StatisticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'settings/pin', element: <PinSettingsPage /> },
      { path: 'settings/labels', element: <LabelsPage /> },
      { path: 'settings/export', element: <ExportImportPage /> },
      { path: 'settings/about', element: <SettingsPage /> },
      { path: 'more', element: <MorePage /> },
    ],
  },
]);
