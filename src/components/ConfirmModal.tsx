// Shared confirmation overlay in the app's style — replaces native confirm().
// Cancel is focused so a stray Enter can't trigger the destructive action.
const base =
  'h-10 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.12em]';

export default function ConfirmModal({
  title,
  body,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
}: {
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      role="dialog"
      aria-modal="true"
      // stopPropagation: hosts below can have their own onClick (e.g. folder nav)
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-neutral-900 bg-[#F3EFE2] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
          Confirm
        </p>
        <h2 className="mt-1 font-serif text-[24px] text-neutral-900">{title}</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-neutral-600">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className={`${base} border-neutral-900 bg-[#F3EFE2] text-neutral-900 hover:bg-[#E7E1CD]`}
            autoFocus
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`${base} border-red-600 bg-red-600 text-[#F3EFE2] hover:bg-red-500`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
