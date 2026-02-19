import {useEffect} from 'react';
import {motion, AnimatePresence, useReducedMotion} from 'framer-motion';
import type {Variants} from 'framer-motion';
import {createPortal} from 'react-dom';
import NeonButton from './NeonButton';
import LanguageToggle from "./LanguageToggle.tsx"; // 👈 On importe NeonButton !

export interface ModalProps {
    isOpen: boolean;
    title?: string;
    onRequestClose: () => void;
    size?: 'sm' | 'lg'; // sm = Login/Compact, lg = Forms/Large
    children: React.ReactNode;
}

export default function Modal({
                                  isOpen,
                                  title,
                                  onRequestClose,
                                  size = 'sm',
                                  children,
                              }: ModalProps) {
    const reduce = useReducedMotion();

    const overlayVariants: Variants = reduce
        ? ({hidden: {opacity: 0}, visible: {opacity: 1}, exit: {opacity: 0}} as unknown as Variants)
        : ({
            hidden: {opacity: 0},
            visible: {opacity: 1},
            exit: {opacity: 0, transition: {duration: 0.2}},
        } as unknown as Variants);

    const modalVariants: Variants = reduce
        ? ({
            hidden: {opacity: 1, y: 0, scale: 1},
            visible: {opacity: 1, y: 0, scale: 1},
            exit: {opacity: 1}
        } as unknown as Variants)
        : ({
            hidden: {opacity: 0, y: 40, scale: 0.96},
            visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {type: 'spring', damping: 25, stiffness: 350, mass: 0.5} as const,
            },
            exit: {opacity: 0, y: 40, scale: 0.96, transition: {duration: 0.2, ease: 'easeIn'}},
        } as unknown as Variants);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onRequestClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onRequestClose]);

    const maxWidth = size === 'lg' ? '56rem' : '24rem';
    const modalRoot = document.getElementById('modal-root') || document.body;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="modal-overlay"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={overlayVariants}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onRequestClose();
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.25rem',
                        background: 'linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(191,241,4,0.22) 100%)',
                        backdropFilter: 'blur(5px)',
                        WebkitBackdropFilter: 'blur(5px)',
                    }}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: maxWidth,
                            maxHeight: 'calc(100vh - 2.5rem)',
                            overflowY: 'auto',
                            backgroundColor: 'white',
                            borderRadius: '1.5rem',
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{position: 'absolute', top: '1rem', left: '1rem', zIndex: 10}}>

                            <LanguageToggle
                                mode="modal"/> {/* 👈 Sélecteur de langue pour faire miroir avec le bouton de langue en haut à gauche */}
                        </div>
                        {/* 👇 Bouton Fermer (NeonButton) en haut à droite 👇 */}
                        <div style={{position: 'absolute', top: '1rem', right: '1rem', zIndex: 10}}>
                            <NeonButton
                                onClick={onRequestClose}
                                variant="outline"
                                aria-label="Fermer"
                                style={{
                                    width: '2.8rem',
                                    height: '2.8rem',
                                    padding: '0',
                                    display: 'inline-flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                label={
                                    <svg
                                        viewBox="0 0 24 24" // 👈 LA CORRECTION EST ICI
                                        width="22" height="22"
                                        fill="none" stroke="currentColor"
                                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                        style={{display: 'block'}} // 👈 Enlève l'espacement fantôme des SVG
                                    >
                                        <path d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                }
                            />
                        </div>

                        {title && (
                            <div style={{padding: '2rem 2rem 0.5rem 2rem'}}>
                                <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>
                                    {title}
                                </h2>
                            </div>
                        )}

                        {/* Le conteneur du contenu (avec son padding de 2rem) */}
                        <div style={{padding: '2rem'}}>
                            {children}
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        modalRoot
    );
}