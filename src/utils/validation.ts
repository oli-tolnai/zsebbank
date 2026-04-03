export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAmount(amount: number): ValidationResult {
  if (amount <= 0) return { valid: false, error: 'Az összeg pozitív kell legyen.' };
  if (!Number.isInteger(amount)) return { valid: false, error: 'Az összeg egész szám kell legyen.' };
  return { valid: true };
}

export function validateExpense(accountBalance: number, amount: number): ValidationResult {
  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) return amountCheck;
  if (amount > accountBalance) return { valid: false, error: 'Nincs elég egyenleg a számlán.' };
  return { valid: true };
}

export function validateTransfer(sourceBalance: number, amount: number): ValidationResult {
  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) return amountCheck;
  if (amount > sourceBalance) return { valid: false, error: 'Nincs elég egyenleg a forrás számlán.' };
  return { valid: true };
}

export function validatePiggyDeposit(accountBalance: number, amount: number): ValidationResult {
  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) return amountCheck;
  if (amount > accountBalance) return { valid: false, error: 'Nincs elég egyenleg a számlán.' };
  return { valid: true };
}

export function validatePiggyWithdraw(piggyAmount: number, amount: number): ValidationResult {
  const amountCheck = validateAmount(amount);
  if (!amountCheck.valid) return amountCheck;
  if (amount > piggyAmount) return { valid: false, error: 'Nincs elég pénz a perselyben.' };
  return { valid: true };
}
