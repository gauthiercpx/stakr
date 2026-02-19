import React from 'react';
import {Link} from 'react-router-dom';
import {motion, AnimatePresence, useScroll, useTransform, type Variants} from 'framer-motion';
import {useMobileMenu} from '../hooks/useMobileMenu';
import {useNavbarAnimation} from '../hooks/useNavbarAnimation';
import {useI18n} from '../i18n/useI18n';
// 👈 Plus besoin d'importer NeonButton ici !

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
                                      brandAriaLabel,
                                      brandContent,
                                      desktopActions,
                                      mobileActions,
                                      burgerAriaLabel,
                                      mobileMenuAriaLabel,
                                  }: AppNavbarProps) {

    const {isOpen, close, toggle, buttonRef, panelRef, panelId} = useMobileMenu();
    const {isHidden} = useNavbarAnimation(isOpen);
    const {t} = useI18n();
    const {scrollY} = useScroll();

    // --- 1. CONFIGURATION DES ANIMATIONS (HOOKS TOP LEVEL) ---
    const navWidth = useTransform(scrollY, [0, 100], ["100%", "92%"]);
    const navTop = useTransform(scrollY, [0, 100], ["0rem", "1.5rem"]);
    const navRadius = useTransform(scrollY, [0, 100], ["0rem", "1.2rem"]);
    const navBackground = useTransform(scrollY, [0, 100], ["rgba(0, 0, 0, 1)", "rgba(15, 15, 15, 0.85)"]);
    const navBorder = useTransform(scrollY, [0, 100], ["rgba(255,255,255,0)", "rgba(255,255,255,0.1)"]);
    const navBackdrop = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(12px)"]);

    const menuTopPadding = useTransform(scrollY, [0, 100], ["4.6rem", "6.2rem"]);

    const navbarVariants = {
        visible: {y: 0, opacity: 1},
        hidden: {y: "-150%", opacity: 0},
    };

    // --- 2. LOGIQUE ENFANTS ---
    const resolvedMobileActions = typeof mobileActions === 'function'
        ? (mobileActions as AppNavbarMobileActionsRender)({closeMenu: close})
        : mobileActions;

    let childrenArray = React.Children.toArray(resolvedMobileActions);
    if (childrenArray.length === 1 && React.isValidElement(childrenArray[0])) {
        const first = childrenArray[0] as React.ReactElement<any>;
        if (first.props && first.props.children) {
            childrenArray = React.Children.toArray(first.props.children);
        }
    }

    const panelVariants: Variants = {
        closed: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            filter: "blur(10px)",
            transition: {duration: 0.2, staggerChildren: 0.05, staggerDirection: -1, when: "afterChildren"}
        },
        open: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {type: "spring", stiffness: 300, damping: 30, delayChildren: 0.1, staggerChildren: 0.08}
        }
    };

    const itemVariants: Variants = {
        closed: {opacity: 0, y: 20, rotateX: -20},
        open: {opacity: 1, y: 0, rotateX: 0, transition: {type: "spring", stiffness: 300, damping: 20}}
    };

    const resolvedBrandAria = brandAriaLabel ?? t('nav.brandAria') ?? 'Go to home';
    const resolvedBurgerLabel = burgerAriaLabel ?? t('nav.menu') ?? 'Menu';
    const resolvedMobileMenuLabel = mobileMenuAriaLabel ?? t('nav.mobileMenu') ?? 'Mobile menu';

    return (
        <>
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    zIndex: 1000,
                    pointerEvents: 'none'
                }}
                variants={navbarVariants}
                initial="hidden"
                animate={isHidden ? "hidden" : "visible"}
                transition={{duration: 0.5, ease: [0.22, 1, 0.36, 1]}}
            >
                <motion.nav
                    style={{
                        width: navWidth,
                        marginTop: navTop,
                        borderRadius: navRadius,
                        backgroundColor: navBackground,
                        border: '1px solid',
                        borderColor: navBorder,
                        backdropFilter: navBackdrop,
                        WebkitBackdropFilter: navBackdrop,
                        pointerEvents: 'auto',
                    }}
                    className="stakr-nav-modern"
                >
                    <div className="stakr-nav__content">
                        <Link to={brandTo} className="stakr-nav__brand" aria-label={resolvedBrandAria}>
                            {brandContent ?? (<>{t('landing.hero.title.brand')}<span
                                style={{color: '#bff104'}}>. </span></>)}
                        </Link>

                        {/* 👇 C'est redevenu ultra simple ! 👇 */}
                        <div className="stakr-nav__desktop">
                            {desktopActions}
                        </div>

                        <button
                            type="button"
                            className={`stakr-nav__burgerBtn ${isOpen ? 'is-active' : ''}`}
                            aria-label={resolvedBurgerLabel}
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            ref={buttonRef}
                            onClick={toggle}
                        >
                            <div className="stakr-nav__burgerLines" aria-hidden="true">
                                <span></span><span></span><span></span>
                            </div>
                        </button>
                    </div>
                </motion.nav>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 999,
                        pointerEvents: 'none'
                    }}>
                        <motion.div
                            id={panelId}
                            ref={panelRef}
                            className="stakr-nav__mobilePanel"
                            style={{
                                width: navWidth,
                                marginTop: menuTopPadding,
                                pointerEvents: 'auto',
                                originY: 0
                            }}
                            role="menu"
                            aria-label={resolvedMobileMenuLabel}
                            variants={panelVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                        >
                            <div className="stakr-nav__mobileRow" style={{perspective: '1000px'}}>
                                {childrenArray.map((child, i) => (
                                    <motion.div key={i} variants={itemVariants}
                                                style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                                        {React.isValidElement(child)
                                            ? React.cloneElement(child as React.ReactElement<any>, {
                                                style: {width: '100%', ...(child as any).props?.style}
                                            })
                                            : child}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}