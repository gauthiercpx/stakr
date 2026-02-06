import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { useNavigationDirection } from './useNavigationDirection';

export interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey?: string;
}

export default function PageTransition({ children, transitionKey }: PageTransitionProps) {
  const location = useLocation();
  const reduceMotion = usePrefersReducedMotion();
  const direction = useNavigationDirection();

  const animation = useMemo(() => {
    if (reduceMotion) return undefined;
    const base = '420ms cubic-bezier(0.22, 1, 0.36, 1) both';
    return direction === 'back'
      ? `stakr-page-enter-left ${base}`
      : `stakr-page-enter-right ${base}`;
  }, [direction, reduceMotion]);

  const key = transitionKey ?? location.key;

  return (
    <div
      style={{
        backgroundColor: '#000000',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      <div
        // key forces a remount on navigation, which reliably retriggers CSS animation
        key={key}
        style={{
          animation,
          willChange: reduceMotion ? undefined : 'opacity, transform',
          backgroundColor: '#f4f4f4',
        }}
      >
        {children}
      </div>
    </div>
  );
}
