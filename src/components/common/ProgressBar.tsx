interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ current, target, color = '#3b82f6', height = 8 }: ProgressBarProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className="w-full bg-slate-100 rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
}
