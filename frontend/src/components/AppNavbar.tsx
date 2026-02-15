import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
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
    brandContent = (<>STAKR<span style={{ color: '#bff104' }}>. </span></>),
    desktopActions,
    mobileActions,
    burgerAriaLabel = 'Menu',
    mobileMenuAriaLabel = 'Mobile menu',
}: AppNavbarProps) {

    const { isOpen, close, toggle, buttonRef, panelRef, panelId } = useMobileMenu();
    const { isScrolled, isHidden } = useNavbarAnimation(isOpen);

    // Résolution des actions mobiles
    const resolvedMobileActions = typeof mobileActions === 'function'
        ? (mobileActions as AppNavbarMobileActionsRender)({ closeMenu: close })
        : mobileActions;

    // Préparation des enfants pour l'animation en cascade
    let childrenArray = React.Children.toArray(resolvedMobileActions);
    if (childrenArray.length === 1 && React.isValidElement(childrenArray[0])) {
        const first = childrenArray[0] as React.ReactElement<any>;
        if (first.props && first.props.children) {
            childrenArray = React.Children.toArray(first.props.children);
        }
    }

    // --- VARIANTES FRAMER MOTION (Le cœur de l'animation) ---

    // Animation de la barre de navigation globale
    const navbarVariants = {
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 },
    };

    // Animation du panneau mobile (Le conteneur)
    const panelVariants: Variants = {
        closed: {
            opacity: 0,
            y: -20, // Remonte légèrement
            scale: 0.96, // Rétrécit un peu
            filter: "blur(10px)", // Devient flou
            transition: {
                duration: 0.2,
                when: "afterChildren", // Attend que les boutons partent pour fermer
                staggerChildren: 0.05,
                staggerDirection: -1 // Les boutons partent du bas vers le haut
            }
        },
        open: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)", // Devient net
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                delayChildren: 0.1, // Petit délai initial
                staggerChildren: 0.08 // Délai entre chaque bouton (La cascade)
            }
        }
    };

    // Animation des Items individuels (Les boutons)
    const itemVariants: Variants = {
        closed: {
            opacity: 0,
            y: 20,
            rotateX: -15, // Bascule vers l'arrière
            transition: { duration: 0.2 }
        },
        open: {
            opacity: 1,
            y: 0,
            rotateX: 0, // Se redresse
            transition: { type: "spring", stiffness: 300, damping: 20 }
        }
    };

    return (
        <motion.nav
            variants={navbarVariants}
            initial="hidden"
            animate={isHidden ? "hidden" : "visible"}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`stakr-nav ${isScrolled ? 'is-scrolled' : ''}`}
        >
            <Link to={brandTo} className="stakr-nav__brand" aria-label={brandAriaLabel}>
                {brandContent}
            </Link>

            <div className="stakr-nav__desktop">{desktopActions}</div>

            <button
                type="button"
                // On ajoute 'is-active' quand c'est ouvert pour déclencher le CSS de l'icône
                className={`stakr-nav__burgerBtn ${isOpen ? 'is-active' : ''}`}
                aria-label={burgerAriaLabel}
                aria-expanded={isOpen}
                aria-controls={panelId}
                ref={buttonRef}
                onClick={toggle}
            >
                <div className="stakr-nav__burgerLines" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id={panelId}
                        ref={panelRef}
                        className={`stakr-nav__mobilePanel ${isOpen ? 'is-open' : ''}`}
                        role="menu"
                        aria-label={mobileMenuAriaLabel}
                        variants={panelVariants as any}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        style={{ originY: 0 }}
                    >
                        <div
                            className="stakr-nav__mobileRow"
                            style={{ perspective: '1000px' }} // Indispensable pour l'effet 3D rotateX
                        >
                            {childrenArray.map((child, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                                >
                                    {/* On clone l'enfant pour forcer width: 100% sans casser ses props existantes */}
                                    {React.isValidElement(child)
                                        ? React.cloneElement(child as React.ReactElement<any>, {
                                            style: { width: '100%', ...(child as any).props?.style }
                                        })
                                        : child}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}