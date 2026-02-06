import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  onRequestClose: () => void;
  /**
   * Sets initial focus inside the modal.
   * If not provided, the close button receives focus.
   */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function Modal({
  isOpen,
  title,
  onRequestClose,
  initialFocusRef,
  children,
}: ModalProps) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const reduceMotion = useMemo(() => prefersReducedMotion(), []);

  const durationMs = reduceMotion ? 0 : 260;

  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      const id = window.setTimeout(() => setHasEntered(false), 0);
      return () => window.clearTimeout(id);
    }

    // Double rAF ensures the browser commits the initial non-visible styles first.
    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => setHasEntered(true));
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [isOpen]);

  // When closing, keep the modal mounted for durationMs to play the exit animation.
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Opening: cancel closing flag (no need to set anything else here)
      if (isClosing) {
        // defer to avoid setState directly in effect body
        window.requestAnimationFrame(() => setIsClosing(false));
      }
      return;
    }

    // Closing
    if (!isClosing) {
      window.requestAnimationFrame(() => setIsClosing(true));
    }

    const timeoutId = window.setTimeout(() => setIsClosing(false), durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, isClosing, durationMs]);

  useEffect(() => {
    if (!isOpen) return;

    // Focus management
    const focusTarget = (initialFocusRef?.current ?? closeBtnRef.current) as
      | HTMLElement
      | null;
    focusTarget?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onRequestClose();

      // Minimal focus trap (Tab cycles within dialog)
      if (e.key === 'Tab') {
        const root = dialogRef.current;
        if (!root) return;

        const focusables = root.querySelectorAll<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (!active || active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, initialFocusRef, onRequestClose]);

  const shouldRender = isOpen || isClosing;
  if (!shouldRender) return null;

  const transitionStyle = reduceMotion
    ? undefined
    : 'opacity 260ms cubic-bezier(0.16, 1, 0.3, 1), transform 260ms cubic-bezier(0.16, 1, 0.3, 1)';

  const isVisible = isOpen && hasEntered && !isClosing;

  return (
    <div
      role="presentation"
      onMouseDown={(e) => {
        // Backdrop click closes (only if click originated on backdrop)
        if (e.target === e.currentTarget) onRequestClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        // Translucent gradient overlay (like the old login background), plus blur.
        background:
          'linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(191,241,4,0.22) 100%)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        opacity: isVisible ? 1 : 0,
        transition: transitionStyle,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        style={{
          width: '100%',
          maxWidth: '24rem',
          background: 'white',
          borderRadius: '1.5rem',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 18px 60px rgba(0,0,0,0.28), 0 6px 18px rgba(0,0,0,0.14)',
          position: 'relative',
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.98)',
          transition: transitionStyle,
        }}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onRequestClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '0.9rem',
            right: '0.9rem',
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(0,0,0,0.16)',
            background: 'white',
            cursor: 'pointer',
            fontSize: '1.2rem',
            lineHeight: 1,
            display: 'grid',
            placeItems: 'center',
          }}
          className="stakr-focus"
        >
          {'×'}
        </button>

        {title && (
          <h2
            id={titleId}
            style={{
              margin: 0,
              padding: '1.4rem 3.2rem 0 1.6rem',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#000',
            }}
          >
            {title}
          </h2>
        )}

        <div style={{ padding: title ? '1rem 1.6rem 1.6rem' : '1.6rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
