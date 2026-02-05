import {useEffect, useState} from 'react';

export function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setPrefersReducedMotion(media.matches);
        update();

        // Modern browsers
        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', update);
            return () => media.removeEventListener('change', update);
        }

        // Legacy Safari fallback (no addEventListener on MediaQueryList).
        // We keep it isolated via a local adapter type to avoid deprecated symbol noise.
        const legacy = media as unknown as {
            addListener: (listener: () => void) => void;
            removeListener: (listener: () => void) => void;
        };

        legacy.addListener(update);
        return () => legacy.removeListener(update);
    }, []);

    return prefersReducedMotion;
}
