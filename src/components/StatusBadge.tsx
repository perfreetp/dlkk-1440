import { Check, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { InspectionStatus, STATUS_LABELS } from '../types';

interface StatusBadgeProps {
  status: InspectionStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<InspectionStatus, { bg: string; icon: typeof Check }> = {
  normal: { bg: 'status-normal', icon: Check },
  mild: { bg: 'status-mild', icon: AlertTriangle },
  severe: { bg: 'status-severe', icon: XCircle },
  pending: { bg: 'status-pending', icon: Clock },
};

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${sizeClasses[size]} transition-all duration-200`}
    >
      {showIcon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />}
      {STATUS_LABELS[status]}
    </span>
  );
}

interface StatusSelectorProps {
  value: InspectionStatus;
  onChange: (status: InspectionStatus) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusSelector({ value, onChange, size = 'md' }: StatusSelectorProps) {
  const statuses: InspectionStatus[] = ['normal', 'mild', 'severe', 'pending'];

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map((status) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        const isActive = value === status;

        return (
          <button
            key={status}
            onClick={() => onChange(status)}
            className={`inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200 ${
              isActive
                ? `${config.bg} ring-2 ring-offset-1 scale-105`
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            } ${sizeClasses[size]}`}
          >
            <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
            {STATUS_LABELS[status]}
          </button>
        );
      })}
    </div>
  );
}
