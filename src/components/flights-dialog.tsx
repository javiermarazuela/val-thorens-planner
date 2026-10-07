import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

// A pop-up on the native <dialog>: focus is trapped, Escape closes it, and the
// page behind stays put. Full screen on a phone, a centred card on desktop.
// Children are mounted only while open, so each open starts fresh.
export function FlightsDialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Keep the page behind from scrolling while the pop-up is open.
  useEffect(() => {
    if (!open) return;
    const before = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = before;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // A click on the dimmed area (the dialog element itself) closes it.
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="flights-dialog-title"
      className="m-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-ink/60 max-sm:m-0 max-sm:h-full max-sm:max-h-none max-sm:max-w-none max-sm:rounded-none"
    >
      {open && (
        <div className="flex max-h-[92svh] flex-col max-sm:h-full max-sm:max-h-none">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <h2 id="flights-dialog-title" className="font-display text-lg uppercase">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-11 place-items-center rounded-full hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
