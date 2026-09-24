import React from 'react';

export const StatusBadge = ({ status, className = '' }) => {
  const norm = String(status || '').toLowerCase().trim();

  let styles = 'bg-surface-container-high text-on-surface-variant';

  if (norm === 'active' || norm === 'present' || norm === 'paid' || norm === 'completed') {
    styles = 'bg-tertiary-fixed/40 text-on-tertiary-fixed-variant';
  } else if (norm === 'inactive' || norm === 'absent' || norm === 'overdue') {
    styles = 'bg-error-container text-on-error-container';
  } else if (norm === 'pending' || norm === 'partial' || norm === 'warning') {
    styles = 'bg-secondary-fixed text-on-secondary-fixed-variant';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
