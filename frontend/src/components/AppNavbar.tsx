import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// 👇 On importe les hooks depuis leurs propres fichiers
import { useMobileMenu } from '../hooks/useMobileMenu';
import { useNavbarAnimation } from '../hooks/useNavbarAnimation';

export type AppNavbarMobileActionsRender = (helpers: { closeMenu: () => void }) => React.ReactNode;

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
    brandContent = (<>STAKR<span style={{color: '#bff104'}}>. </span></>),
    desktopActions,
    mobileActions,
    burgerAriaLabel = 'Menu',
    mobileMenuAriaLabel = 'Mobile menu',
}: AppNavbarProps) {

    // 👇 Utilisation correcte des hooks
    const { isOpen, close, toggle, buttonRef, panelRef, panelId } = useMobileMenu();
    const { isScrolled, isHidden } = useNavbarAnimation(isOpen);

    const resolvedMobileActions = typeof mobileActions === 'function'
        ? (mobileActions as AppNavbarMobileActionsRender)({ closeMenu: close })
        : mobileActions;

    const navbarVariants = {
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 },
    };

    return (
        <motion.nav
            variants={navbarVariants}
            initial="hidden"
            animate={isHidden ? "hidden" : "visible"}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={`stakr-nav ${isScrolled ? 'is-scrolled' : ''}`}
        >
            <Link to={brandTo} className="stakr-nav__brand" aria-label={brandAriaLabel}>
                {brandContent}
            </Link>

            <div className="stakr-nav__desktop">{desktopActions}</div>

            <button
                type="button"
                className="stakr-nav__burgerBtn"
                aria-label={burgerAriaLabel}
                aria-expanded={isOpen}
                aria-controls={panelId}
                ref={buttonRef}
                onClick={toggle}
            >
                <span className="stakr-nav__burgerLines" aria-hidden>
                    <span/>
                    <span/>
                    <span/>
                </span>
            </button>

            <div
                id={panelId}
                ref={panelRef}
                className={`stakr-nav__mobilePanel ${isOpen ? 'is-open' : ''}`}
                role="menu"
                aria-label={mobileMenuAriaLabel}
            >
                <div className="stakr-nav__mobileRow">{resolvedMobileActions}</div>
            </div>
        </motion.nav>
    );
}