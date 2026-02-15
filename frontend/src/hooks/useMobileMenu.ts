import { useState, useRef, useEffect, useId } from 'react';

export function useMobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuId = useId();
    const panelId = `stakr-mobile-menu-${menuId}`;

    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);

    const close = () => setIsOpen(false);
    const toggle = () => setIsOpen((prev) => !prev);

    // 1. Gestion de la touche Echap
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    // 2. Gestion du clic extérieur
    useEffect(() => {
        if (!isOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as Node | null;
            if (!target) return;
            if (
                panelRef.current && !panelRef.current.contains(target) &&
                buttonRef.current && !buttonRef.current.contains(target)
            ) {
                close();
            }
        };
        window.addEventListener('pointerdown', onPointerDown);
        return () => window.removeEventListener('pointerdown', onPointerDown);
    }, [isOpen]);

    // 3. Gestion intelligente du Focus
    const prevIsOpenRef = useRef(isOpen);
    useEffect(() => {
        if (prevIsOpenRef.current === true && isOpen === false) {
            buttonRef.current?.focus();
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen]);

    return {
        isOpen,
        close,
        toggle,
        buttonRef,
        panelRef,
        panelId
    };
}