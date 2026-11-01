import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ContextualPanelProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  width?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export const ContextualPanel: React.FC<ContextualPanelProps> = ({
  title,
  subtitle,
  onClose,
  width = 'w-96',
  children,
  position = 'left'
}) => {
  return (
    <div
      className={`absolute top-0 bottom-0 ${
        position === 'left' ? 'left-0 border-r' : 'right-0 border-l'
      } ${width} bg-white border-[#E2E8F0] shadow-xl z-20 flex flex-col select-none animate-in fade-in slide-in-from-${position} duration-200`}
    >
      {/* Panel Header */}
      <div className="h-14 px-4 border-b border-[#E2E8F0] flex items-center justify-between shrink-0 bg-[#F8FAFC]">
        <div className="flex flex-col truncate pr-2">
          <h3 className="text-sm font-bold text-[#172033] truncate">{title}</h3>
          {subtitle && (
            <span className="text-[11px] text-[#64748B] truncate">{subtitle}</span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#E2E8F0]/60 transition-colors cursor-pointer shrink-0"
          title="Close Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {children}
      </div>
    </div>
  );
};

