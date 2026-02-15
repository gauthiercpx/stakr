import { useState, useEffect, useRef } from 'react';

export function useNavbarAnimation(isMenuOpen: boolean) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    // On initialise avec la position actuelle
    const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const previousScrollY = lastScrollY.current;

            // 1. Effet Glass (Flou) dès 10px
            setIsScrolled(currentScrollY > 10);

            // 2. Logique Smart Navbar
            if (isMenuOpen) {
                // Si menu ouvert -> Toujours visible
                setIsHidden(false);
            }
            else if (currentScrollY < 60) {
                // Si tout en haut -> Toujours visible
                setIsHidden(false);
            }
            else if (currentScrollY > previousScrollY) {
                // Si on descend (et qu'on n'est pas en haut) -> CACHER
                setIsHidden(true);
            }
            else {
                // Si on remonte -> AFFICHER
                setIsHidden(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMenuOpen]);

    return { isScrolled, isHidden };
}