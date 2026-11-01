import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col space-y-2 pointer-events-none select-none max-w-sm w-full">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        const bg = isSuccess
          ? 'bg-[#F0FDF4] border-[#16A34A]/30 text-[#16A34A]'
          : isWarning
          ? 'bg-[#FFFBEB] border-[#D97706]/30 text-[#D97706]'
          : isError
          ? 'bg-[#FEF2F2] border-[#DC2626]/30 text-[#DC2626]'
          : 'bg-[#F0F9FF] border-[#0284C7]/30 text-[#0284C7]';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start space-x-2.5 transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${bg}`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
            {isWarning && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            {!isSuccess && !isWarning && !isError && <Info className="w-4 h-4 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs font-medium text-[#172033] leading-snug">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#64748B] hover:text-[#172033] p-0.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
