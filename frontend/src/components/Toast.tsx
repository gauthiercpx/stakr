import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface ToastProps {
  message: string;
  /** milliseconds */
  durationMs?: number;
  onDone?: () => void;
}

export default function Toast({ message, durationMs = 3200, onDone }: ToastProps) {
  const reduceMotion = usePrefersReducedMotion();

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Double rAF ensures the browser has committed initial styles before transitioning.
    let raf1 = 0;
    let raf2 = 0;

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => setIsVisible(true));
    });

    const hideAt = window.setTimeout(() => setIsVisible(false), durationMs);
    const exitMs = reduceMotion ? 0 : 420;
    const doneAt = window.setTimeout(() => onDone?.(), durationMs + exitMs);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(hideAt);
      window.clearTimeout(doneAt);
    };
  }, [durationMs, onDone, reduceMotion]);

  const transition = reduceMotion
    ? undefined
    : 'opacity 420ms cubic-bezier(0.16, 1, 0.3, 1), transform 420ms cubic-bezier(0.16, 1, 0.3, 1)';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        insetInline: 0,
        display: 'flex',
        justifyContent: 'center',
        paddingInline: '0.75rem',
        // Safe area friendly bottom (iOS) + keep it visible on small viewports
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
        transform: isVisible ? 'translateY(0)' : 'translateY(0.5rem)',
        opacity: isVisible ? 1 : 0,
        transition,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          padding: '0.85rem 1.1rem',
          borderRadius: '1rem',
          background: 'rgba(0,0,0,0.86)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 14px 46px rgba(0,0,0,0.26)',
          fontWeight: 700,
          maxWidth: '28rem',
          width: '100%',
          textAlign: 'center',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        {message}
      </div>
    </div>
  );
}
