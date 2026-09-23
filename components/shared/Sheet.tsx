import React, { useEffect, useRef, useState } from 'react';

interface SheetProps {
  onClose: () => void;
  /** Accessible name of the dialog. */
  label: string;
  /**
   * False while a transaction is in flight: the backdrop, Escape and the drag
   * handle stop closing it, so a buyer cannot lose the hash by dismissing.
   */
  dismissable?: boolean;
  /** Width on md and up, where the sheet becomes a centred dialog. */
  width?: 'md' | 'lg';
  children: React.ReactNode;
}

/** The scrolling middle of a sheet. Headers and pinned footers sit outside it. */
export const SHEET_BODY = 'min-h-0 flex-1 overflow-y-auto overscroll-contain';

/** How far the handle has to travel before letting go closes the sheet. */
const DISMISS_PX = 96;

/**
 * Every modal in the app, one shape. Below md it is a bottom sheet: full width,
 * rounded top, a drag handle, at most 90dvh with the body scrolling inside, and
 * padding for the home indicator. From md up it is the centred dialog it was.
 * It sits above the bottom tab bar (z-40).
 */
export function Sheet({ onClose, label, dismissable = true, width = 'md', children }: SheetProps) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);
  const canClose = useRef(dismissable);
  canClose.current = dismissable;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canClose.current) onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!dismissable) return;
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    setDragY(Math.max(0, e.touches[0].clientY - startY.current));
  };
  const onTouchEnd = () => {
    if (startY.current === null) return;
    startY.current = null;
    if (dragY > DISMISS_PX) onClose();
    setDragY(0);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 backdrop-blur-sm md:items-center md:p-4"
      onClick={dismissable ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
        className={`flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-card border-t border-line-hairline bg-surface-slab pb-[env(safe-area-inset-bottom)] md:rounded-card md:border md:pb-0 ${
          width === 'lg' ? 'md:max-w-2xl' : 'md:max-w-md'
        } ${dragY ? '' : 'transition-transform duration-base'}`}
      >
        <div
          className="flex shrink-0 touch-none justify-center pb-1 pt-2.5 md:hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          aria-hidden
        >
          <span className="h-1 w-10 rounded-full bg-surface-ridge" />
        </div>
        {children}
      </div>
    </div>
  );
}
