import {useCallback, useEffect, useId, useRef} from 'react';
import {motion, useIsPresent, useReducedMotion} from 'framer-motion';
import type {Variants} from 'framer-motion';
import {createPortal} from 'react-dom';
import NeonButton from './NeonButton';
import LanguageToggle from './LanguageToggle.tsx';

export interface ModalProps {
    isOpen: boolean;
    title?: string;
    onRequestClose: () => void;
    size?: 'sm' | 'lg';
    children: React.ReactNode;
}

// Elements that can receive keyboard focus inside the dialog.
const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function Modal({
                                  isOpen,
                                  title,
                                  onRequestClose,
                                  size = 'sm',
                                  children,
                              }: ModalProps) {
    const reduce = useReducedMotion();
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const titleId = useId();

    // False from the moment AnimatePresence starts removing us. The node can
    // outlive that moment (an exit animation that never reports completion
    // would keep it mounted forever), so everything that would trap the user —
    // the scroll lock, pointer capture, the key handlers — keys off this rather
    // than off the node still being in the DOM.
    const isPresent = useIsPresent();
    const isActive = isOpen && isPresent;

    useEffect(() => {
        if (!isActive) {
            return;
        }

        const {body, documentElement} = document;
        const previousBodyOverflow = body.style.overflow;
        const previousBodyPaddingRight = body.style.paddingRight;
        const previousHtmlOverflow = documentElement.style.overflow;

        // Compensate scrollbar removal to avoid horizontal layout shift.
        const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

        body.style.overflow = 'hidden';
        documentElement.style.overflow = 'hidden';

        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            body.style.overflow = previousBodyOverflow;
            body.style.paddingRight = previousBodyPaddingRight;
            documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [isActive]);

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
            exit: {
                opacity: 0,
                y: 20,
                scale: 0.96,
                transition: {duration: 0.2, ease: 'easeIn'}
            }
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

    const getFocusable = useCallback(() => {
        const dialog = dialogRef.current;
        if (!dialog) {
            return [] as HTMLElement[];
        }
        return Array.from(
            dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    }, []);

    // Move focus into the dialog on open, and hand it back to the trigger on close.
    useEffect(() => {
        if (!isActive) {
            return;
        }

        const previouslyFocused = document.activeElement as HTMLElement | null;

        // Wait a frame so the dialog content is mounted before focusing it.
        // Content that autofocuses a field (a form, say) keeps that focus;
        // otherwise focus lands on the dialog itself so it gets announced.
        const frame = window.requestAnimationFrame(() => {
            const dialog = dialogRef.current;
            if (dialog && !dialog.contains(document.activeElement)) {
                dialog.focus();
            }
        });

        return () => {
            window.cancelAnimationFrame(frame);
            previouslyFocused?.focus?.();
        };
    }, [getFocusable, isActive]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onRequestClose();
                return;
            }

            if (e.key !== 'Tab') {
                return;
            }

            // Keep Tab cycling inside the dialog instead of reaching the page behind it.
            const focusable = getFocusable();
            if (focusable.length === 0) {
                e.preventDefault();
                dialogRef.current?.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (!dialogRef.current?.contains(active)) {
                e.preventDefault();
                (e.shiftKey ? last : first).focus();
                return;
            }

            if (e.shiftKey && active === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        };

        if (isActive) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [getFocusable, isActive, onRequestClose]);

    if (!isOpen) {
        return null;
    }

    const maxWidth = size === 'lg' ? '56rem' : '24rem';
    const modalRoot = document.getElementById('modal-root') || document.body;

    return createPortal(
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
                // On the way out the overlay must never swallow clicks meant for
                // the page underneath, however long the exit takes to finish.
                pointerEvents: isActive ? 'auto' : 'none',
            }}
        >
            <motion.div
                ref={dialogRef}
                layout
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{
                    layout: {type: 'spring', bounce: 0, duration: 0.4},
                    opacity: {duration: 0.2}
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                tabIndex={-1}
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
                    <LanguageToggle mode="modal"/>
                </div>
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
                                viewBox="0 0 24 24"
                                width="22" height="22"
                                fill="none" stroke="currentColor"
                                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                style={{display: 'block'}}
                            >
                                <path d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        }
                    />
                </div>

                {title && (
                    <div style={{padding: '2rem 2rem 0.5rem 2rem'}}>
                        <h2 id={titleId} style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>
                            {title}
                        </h2>
                    </div>
                )}

                <div style={{padding: '2rem'}}>
                    {children}
                </div>

            </motion.div>
        </motion.div>


        , modalRoot
    )
        ;
}