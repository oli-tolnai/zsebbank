import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
}

export function PageHeader({ title, showBack = false, right }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 z-30 pt-safe">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-slate-100">
              <ArrowLeft size={22} className="text-slate-600" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        </div>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </div>
  );
}
