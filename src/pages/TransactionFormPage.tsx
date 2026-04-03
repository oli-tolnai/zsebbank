import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAccountStore } from '@/stores/accountStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { AccountPicker } from '@/components/common/AccountPicker';
import { LabelPicker } from '@/components/common/LabelPicker';
import { AmountDisplay } from '@/components/common/AmountDisplay';
import { Strings } from '@/constants/strings';
import { showToast } from '@/components/ui/Toast';
import { getToday, formatHuf } from '@/utils/format';
import { validateExpense, validateTransfer, validateAmount } from '@/utils/validation';
import type { TransactionType, Transaction } from '@/types';

export function TransactionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const accounts = useAccountStore((s) => s.accounts);
  const getAccount = useAccountStore((s) => s.getAccount);
  const { addTransaction, updateTransaction, getById } = useTransactionStore();

  const [originalTx, setOriginalTx] = useState<Transaction | null>(null);
  const [type, setType] = useState<TransactionType>((searchParams.get('type') as TransactionType) || 'expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState('');
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getToday());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      getById(id).then((tx) => {
        if (tx) {
          setOriginalTx(tx);
          setType(tx.type);
          setName(tx.name);
          setAmount(tx.amount);
          setAccountId(tx.accountId);
          setToAccountId(tx.toAccountId ?? '');
          setLabelIds(tx.labelIds);
          setDescription(tx.description ?? '');
          setDate(tx.date);
        }
      });
    }
  }, [id, getById]);

  const selectedAccount = getAccount(accountId);
  const availableBalance = selectedAccount?.balance ?? 0;

  // For edits, add back the old amount when calculating available balance
  const effectiveBalance = isEdit && originalTx && originalTx.accountId === accountId
    ? (originalTx.type === 'expense' ? availableBalance + originalTx.amount :
       originalTx.type === 'income' ? availableBalance - originalTx.amount : availableBalance)
    : availableBalance;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'A megnevezés kötelező.';

    const amountResult = validateAmount(amount);
    if (!amountResult.valid) newErrors.amount = amountResult.error!;

    if (!accountId) newErrors.account = 'Válassz számlát.';

    if (type === 'expense') {
      const result = validateExpense(effectiveBalance, amount);
      if (!result.valid && !newErrors.amount) newErrors.amount = result.error!;
    }

    if (type === 'transfer') {
      if (!toAccountId) newErrors.toAccount = 'Válassz cél számlát.';
      if (toAccountId === accountId) newErrors.toAccount = 'A forrás és cél nem lehet ugyanaz.';
      const result = validateTransfer(effectiveBalance, amount);
      if (!result.valid && !newErrors.amount) newErrors.amount = result.error!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    if (validate()) setShowPreview(true);
  };

  const handleSave = async () => {
    if (!validate()) return;

    const data = {
      type,
      amount,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : null,
      labelIds,
      name: name.trim(),
      description: description.trim() || null,
      date,
      recurringId: originalTx?.recurringId ?? null,
    };

    try {
      if (isEdit && originalTx) {
        await updateTransaction(id!, originalTx, data);
        showToast('success', 'Tranzakció módosítva!');
      } else {
        await addTransaction(data);
        showToast('success', 'Tranzakció hozzáadva!');
      }
      navigate(-1);
    } catch (e) {
      showToast('error', (e as Error).message);
    }
  };

  if (showPreview) {
    const account = getAccount(accountId);
    const toAcc = toAccountId ? getAccount(toAccountId) : null;
    return (
      <div>
        <PageHeader title={Strings.transaction.preview} showBack />
        <div className="px-4 py-4 space-y-4">
          <Card>
            <div className="space-y-3 text-center">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                type === 'income' ? 'bg-income-light text-income' : type === 'expense' ? 'bg-expense-light text-expense' : 'bg-transfer-light text-transfer'
              }`}>
                {type === 'income' ? Strings.transaction.income : type === 'expense' ? Strings.transaction.expense : Strings.transaction.transfer}
              </div>
              <p className="text-lg font-semibold">{name}</p>
              <AmountDisplay amount={amount} type={type} size="lg" />
              <div className="text-sm text-slate-500">
                <p>{account?.name}{toAcc ? ` → ${toAcc.name}` : ''}</p>
                <p>{date}</p>
              </div>
              {description && <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{description}</p>}
            </div>
          </Card>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setShowPreview(false)}>
              {Strings.common.back}
            </Button>
            <Button fullWidth onClick={handleSave}>
              {Strings.common.save}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={isEdit ? Strings.transaction.edit : Strings.transaction.addNew} showBack />
      <div className="px-4 py-4 space-y-4">
        <SegmentedControl
          options={[
            { value: 'income' as TransactionType, label: Strings.transaction.income },
            { value: 'expense' as TransactionType, label: Strings.transaction.expense },
            { value: 'transfer' as TransactionType, label: Strings.transaction.transfer },
          ]}
          value={type}
          onChange={(v) => { setType(v); setErrors({}); }}
        />

        <Card>
          <div className="space-y-4">
            <Input
              label={Strings.transaction.name}
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors({}); }}
              placeholder="pl. Bevásárlás, Fizetés..."
              error={errors.name}
            />

            <AmountInput
              label={Strings.transaction.amount}
              value={amount}
              onChange={(v) => { setAmount(v); setErrors({}); }}
              error={errors.amount}
            />

            <Input
              label={Strings.transaction.date}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                {type === 'transfer' ? Strings.transaction.fromAccount : Strings.transaction.account}
              </label>
              <AccountPicker
                value={accountId}
                onChange={(v) => { setAccountId(v); setErrors({}); }}
                excludeId={type === 'transfer' ? toAccountId : undefined}
                error={errors.account}
              />
              {(type === 'expense' || type === 'transfer') && selectedAccount && (
                <p className="text-xs text-slate-500 mt-1">
                  {Strings.transaction.available}: {formatHuf(effectiveBalance)}
                </p>
              )}
            </div>

            {type === 'transfer' && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">{Strings.transaction.toAccount}</label>
                <AccountPicker
                  value={toAccountId}
                  onChange={(v) => { setToAccountId(v); setErrors({}); }}
                  excludeId={accountId}
                  error={errors.toAccount}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">{Strings.transaction.labels}</label>
              <LabelPicker
                selectedIds={labelIds}
                onChange={setLabelIds}
                filterType={type === 'transfer' ? 'all' : type === 'income' ? 'income' : 'expense'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                {Strings.transaction.description} <span className="text-slate-400">({Strings.common.optional})</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base outline-none focus:border-primary transition-colors resize-none"
                placeholder="Megjegyzés..."
              />
            </div>
          </div>
        </Card>

        <Button fullWidth onClick={handlePreview}>
          {Strings.transaction.preview}
        </Button>
      </div>
    </div>
  );
}
