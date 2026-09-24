import React from 'react';

export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDestructive ? 'bg-error-container text-on-error-container' : 'bg-secondary-fixed text-on-secondary-fixed'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isDestructive ? 'warning' : 'help_outline'}
            </span>
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface font-headline">{title}</h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-sm transition-colors ${
              isDestructive ? 'bg-error hover:bg-[#93000a]' : 'bg-primary hover:bg-[#00174b]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
