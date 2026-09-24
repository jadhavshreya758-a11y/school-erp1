import React from 'react';

export const EmptyState = ({
  icon = 'inbox',
  title = 'No records found',
  description = 'Try adjusting your search criteria or create a new entry.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/30 my-4">
      <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-3">
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <h3 className="font-headline font-bold text-sm text-on-surface mb-1">{title}</h3>
      <p className="text-xs text-outline max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#00174b] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export const LoadingState = ({ message = 'Loading academic records...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-8 h-8 border-3 border-secondary-fixed border-t-primary rounded-full animate-spin mb-3" />
      <p className="text-xs font-medium text-outline">{message}</p>
    </div>
  );
};

export default EmptyState;
