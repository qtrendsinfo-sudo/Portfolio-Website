import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm Delete',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) {
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md border border-white/15 bg-[#111114] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span className="font-mono-tabular text-[11px] tracking-[0.18em]">
              CONFIRM ACTION
            </span>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            aria-label="Close confirmation dialog"
            className="inline-flex h-8 w-8 items-center justify-center border border-white/10 text-[#a1a1aa] hover:border-white/30 hover:text-[#f4f4f0] disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3
          id="confirm-dialog-title"
          className="mt-4 font-display text-xl font-semibold text-[#f4f4f0]"
        >
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#a1a1aa]">{description}</p>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-5">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="min-h-[40px] border border-white/15 px-4 py-2 text-xs font-medium tracking-[0.12em] text-[#d4d4d8] hover:border-white/30 hover:text-[#f4f4f0] disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="min-h-[40px] bg-rose-500 px-5 py-2 text-xs font-semibold tracking-[0.12em] text-white hover:bg-rose-400 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {busy ? 'DELETING...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
