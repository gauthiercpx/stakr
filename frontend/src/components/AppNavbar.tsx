import {useEffect, useId, useRef, useState} from 'react';
import {Link} from 'react-router-dom';

export type AppNavbarMobileActionsRender = (helpers: {closeMenu: () => void}) => React.ReactNode;

interface AppNavbarProps {
    brandTo?: string;
    brandAriaLabel?: string;
    brandContent?: React.ReactNode;

    desktopActions?: React.ReactNode;
    mobileActions?: React.ReactNode | AppNavbarMobileActionsRender;

    burgerAriaLabel?: string;
    mobileMenuAriaLabel?: string;
}

export default function AppNavbar({
    brandTo = '/',
    brandAriaLabel = 'Go to home',
    brandContent = (
        <>
            STAKR<span style={{color: '#bff104'}}>. </span>
        </>
    ),
    desktopActions,
    mobileActions,
    burgerAriaLabel = 'Menu',
    mobileMenuAriaLabel = 'Mobile menu',
}: AppNavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuId = useId();
    const mobilePanelId = `stakr-mobile-menu-${menuId}`;
    const burgerButtonRef = useRef<HTMLButtonElement | null>(null);
    const mobilePanelRef = useRef<HTMLDivElement | null>(null);

    const closeMenu = () => setIsMenuOpen(false);

    useEffect(() => {
        if (!isMenuOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeMenu();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isMenuOpen]);

    useEffect(() => {
        if (!isMenuOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as Node | null;
            if (!target) return;

            const panel = mobilePanelRef.current;
            const burger = burgerButtonRef.current;
            const clickedInsidePanel = !!panel && panel.contains(target);
            const clickedBurger = !!burger && burger.contains(target);
            if (!clickedInsidePanel && !clickedBurger) {
                closeMenu();
            }
        };

        window.addEventListener('pointerdown', onPointerDown);
        return () => window.removeEventListener('pointerdown', onPointerDown);
    }, [isMenuOpen]);

    useEffect(() => {
        if (isMenuOpen) return;
        burgerButtonRef.current?.focus();
    }, [isMenuOpen]);

    const resolvedMobileActions =
        typeof mobileActions === 'function'
            ? (mobileActions as AppNavbarMobileActionsRender)({closeMenu})
            : mobileActions;

    return (
        <nav className="stakr-nav">
            <Link to={brandTo} className="stakr-nav__brand" aria-label={brandAriaLabel}>
                {brandContent}
            </Link>

            {/* Desktop actions */}
            <div className="stakr-nav__desktop">{desktopActions}</div>

            {/* Mobile burger */}
            <button
                type="button"
                className="stakr-nav__burgerBtn"
                aria-label={burgerAriaLabel}
                aria-expanded={isMenuOpen}
                aria-controls={mobilePanelId}
                ref={burgerButtonRef}
                onClick={() => setIsMenuOpen((v) => !v)}
            >
                <span className="stakr-nav__burgerLines" aria-hidden>
                    <span/>
                    <span/>
                    <span/>
                </span>
            </button>

            <div
                id={mobilePanelId}
                ref={mobilePanelRef}
                className={`stakr-nav__mobilePanel ${isMenuOpen ? 'is-open' : ''}`}
                role="menu"
                aria-label={mobileMenuAriaLabel}
            >
                <div className="stakr-nav__mobileRow">{resolvedMobileActions}</div>
            </div>
        </nav>
    );
}

