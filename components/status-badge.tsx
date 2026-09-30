import React from 'react';
import { CapabilityStatus } from '@/lib/types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: CapabilityStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (status === 'AVAILABLE') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}
      >
        {showIcon && <CheckCircle2 className={iconSizes[size]} />}
        AVAILABLE
      </span>
    );
  }

  if (status === 'LIMITED') {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses[size]}`}
      >
        {showIcon && <AlertTriangle className={iconSizes[size]} />}
        LIMITED
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses[size]}`}
    >
      {showIcon && <XCircle className={iconSizes[size]} />}
      UNAVAILABLE
    </span>
  );
};
