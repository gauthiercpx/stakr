import { useEffect, useRef, useState } from 'react';
import { useLocation, type Location } from 'react-router-dom';

export type NavigationDirection = 'forward' | 'back';

function getKey(loc: Location): string {
  // In React Router, key is usually a short string. Fallback for safety.
  return typeof loc.key === 'string' ? loc.key : `${loc.pathname}${loc.search}${loc.hash}`;
}

/**
 * Infers navigation direction (forward/back) based on the location.key history stack.
 *
 * Contract:
 * - forward: pushes a new key
 * - back: returns to a previous key already in the stack
 */
export function useNavigationDirection(): NavigationDirection {
  const location = useLocation();
  const stackRef = useRef<string[]>([]);
  const [direction, setDirection] = useState<NavigationDirection>('forward');

  useEffect(() => {
    const key = getKey(location);
    const stack = stackRef.current;

    const existingIndex = stack.indexOf(key);
    if (existingIndex !== -1) {
      // back/forward to an existing entry
      const isBack = existingIndex < stack.length - 1;
      window.requestAnimationFrame(() => setDirection(isBack ? 'back' : 'forward'));
      stackRef.current = stack.slice(0, existingIndex + 1);
      return;
    }

    // new navigation
    window.requestAnimationFrame(() => setDirection('forward'));
    stackRef.current = [...stack, key];
  }, [location]);

  return direction;
}
