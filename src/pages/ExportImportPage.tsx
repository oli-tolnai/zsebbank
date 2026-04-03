import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Strings } from '@/constants/strings';
import { showToast } from '@/components/ui/Toast';
import { exportBackup, importBackup } from '@/utils/backup';
import { saveJsonFile, pickJsonFile } from '@/utils/fileSystem';
import { useAccountStore } from '@/stores/accountStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useLabelStore } from '@/stores/labelStore';
import { useRecurringStore } from '@/stores/recurringStore';
import { usePiggyStore } from '@/stores/piggyStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Download, Upload } from 'lucide-react';
import type { ZsebbankBackup } from '@/types';

export function ExportImportPage() {
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<ZsebbankBackup | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const reloadAll = async () => {
    await useAccountStore.getState().load();
    await useTransactionStore.getState().load();
    await useLabelStore.getState().load();
    await useRecurringStore.getState().load();
    await usePiggyStore.getState().load();
    await useSettingsStore.getState().load();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backup = await exportBackup();
      const json = JSON.stringify(backup, null, 2);
      const filename = `zsebbank_backup_${new Date().toISOString().split('T')[0]}.json`;
      await saveJsonFile(filename, json);
      showToast('success', Strings.settings.exportSuccess);
    } catch (e) {
      showToast('error', (e as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportPick = async () => {
    try {
      const text = await pickJsonFile();
      if (!text) return;
      const backup = JSON.parse(text) as ZsebbankBackup;
      setPendingImport(backup);
      setShowImportConfirm(true);
    } catch (e) {
      showToast('error', 'Érvénytelen fájl.');
    }
  };

  const handleImportConfirm = async () => {
    if (!pendingImport) return;
    try {
      await importBackup(pendingImport);
      await reloadAll();
      showToast('success', Strings.settings.importSuccess);
    } catch (e) {
      showToast('error', (e as Error).message);
    } finally {
      setPendingImport(null);
      setShowImportConfirm(false);
    }
  };

  return (
    <div>
      <PageHeader title="Export / Import" showBack />
      <div className="px-4 py-4 space-y-4">
        <Card>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold mb-1">{Strings.settings.export}</h3>
              <p className="text-sm text-slate-500 mb-3">Az összes adat mentése JSON fájlba.</p>
              <Button fullWidth onClick={handleExport} disabled={isExporting}>
                <div className="flex items-center justify-center gap-2">
                  <Download size={18} />
                  {isExporting ? 'Exportálás...' : Strings.settings.export}
                </div>
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold mb-1">{Strings.settings.import}</h3>
              <p className="text-sm text-slate-500 mb-1">Adatok visszaállítása mentésfájlból.</p>
              <p className="text-sm text-warning font-medium mb-3">{Strings.settings.importWarning}</p>
              <Button variant="secondary" fullWidth onClick={handleImportPick}>
                <div className="flex items-center justify-center gap-2">
                  <Upload size={18} />
                  {Strings.settings.import}
                </div>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={showImportConfirm}
        onClose={() => { setShowImportConfirm(false); setPendingImport(null); }}
        onConfirm={handleImportConfirm}
        title={Strings.settings.import}
        message={Strings.settings.importWarning}
        confirmLabel="Importálás"
        danger
      />
    </div>
  );
}
