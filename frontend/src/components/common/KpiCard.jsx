import React from 'react';

export const KpiCard = ({
  label,
  value,
  subtext,
  icon,
  badgeText,
  badgeType = 'positive', // 'positive' | 'warning' | 'neutral' | 'error'
  accentBarColor,
  onClick,
}) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'positive':
        return 'bg-tertiary-fixed/30 text-on-tertiary-fixed-variant';
      case 'error':
        return 'bg-error-container text-on-error-container';
      case 'warning':
        return 'bg-secondary-fixed text-on-secondary-fixed-variant';
      default:
        return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 shadow-sm transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-outline">{label}</span>
          <div className="font-headline text-3xl font-bold text-on-surface tabular-nums mt-1 leading-none">
            {value}
          </div>
        </div>
        {icon && (
          <div className="h-11 w-11 rounded-xl bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
            <span className="material-symbols-outlined text-[24px]">{icon}</span>
          </div>
        )}
      </div>

      {(badgeText || subtext) && (
        <div className="mt-4 flex items-center gap-2 pt-1 flex-wrap">
          {badgeText && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getBadgeStyle()}`}>
              {badgeText}
            </span>
          )}
          {subtext && <span className="text-xs text-outline">{subtext}</span>}
        </div>
      )}

      {accentBarColor && (
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${accentBarColor}`} />
      )}
    </div>
  );
};

export default KpiCard;
