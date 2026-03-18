import { useState, useEffect, useRef } from 'react';

export function useNavbarAnimation(isMenuOpen: boolean) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    // Initialize with the current scroll position.
    const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const previousScrollY = lastScrollY.current;

            // Enable compact navbar styling after a small scroll threshold.
            setIsScrolled(currentScrollY > 10);

            // 2. Logique Smart Navbar
            if (isMenuOpen) {
                setIsHidden(false);
            }
            else if (currentScrollY < 60) {
                setIsHidden(false);
            }
            else if (currentScrollY > previousScrollY) {
                setIsHidden(true);
            }
            else {
                setIsHidden(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMenuOpen]);

    return { isScrolled, isHidden };
}