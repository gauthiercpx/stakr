import type {CSSProperties} from 'react';
import {useEffect, useState} from 'react';

import {useI18n} from '../i18n/useI18n';
import NeonButton from './NeonButton';
import {usePrefersReducedMotion} from './usePrefersReducedMotion';

type LanguageToggleMode = 'default' | 'modal';


export default function LanguageToggle({
    style,
    mode = 'default',
}: {
    style?: CSSProperties;
    mode?: LanguageToggleMode;
}) {
    const {locale, toggleLocale, t} = useI18n();
    const tooltipText = t('common.languageToggle');
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();

    const isLogin = mode === 'modal';

    // Detect if device supports hover (to disable hover/focus on touch devices)
    const [canHover, setCanHover] = useState<boolean>(false);
    const [isMobileWidth, setIsMobileWidth] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mqHover = window.matchMedia('(hover: hover) and (pointer: fine)');
        const mqMobile = window.matchMedia('(max-width: 640px)');

        const update = () => {
            setCanHover(!!mqHover.matches);
            setIsMobileWidth(!!mqMobile.matches);
        };

        update();
        try {
            mqHover.addEventListener('change', update);
            mqMobile.addEventListener('change', update);
            return () => {
                mqHover.removeEventListener('change', update);
                mqMobile.removeEventListener('change', update);
            };
        } catch (e) {
            // Fallback for older browsers
            // eslint-disable-next-line deprecation/deprecation
            mqHover.addListener(update);
            // eslint-disable-next-line deprecation/deprecation
            mqMobile.addListener(update);
            return () => {
                // eslint-disable-next-line deprecation/deprecation
                mqHover.removeListener(update);
                // eslint-disable-next-line deprecation/deprecation
                mqMobile.removeListener(update);
            };
        }
    }, []);

    const handleToggle: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        toggleLocale();
        // Sur desktop, on évite l’état "focus" qui reste après un clic souris.
        // On conserve l’accessibilité clavier: un focus clavier reste géré via onFocus/onBlur.
        e.currentTarget.blur();
    };

    // --- Login mode: keep the previous smooth slider switch ---
    if (isLogin) {
        const isEn = locale === 'en';

        return (
            <button
                type="button"
                onClick={handleToggle}
                aria-label={tooltipText}
                title={tooltipText}
                style={{
                    border: '1px solid rgba(0,0,0,0.15)',
                    backgroundColor: 'rgba(255,255,255,0.75)',
                    borderRadius: '999px',
                    height: '2rem',
                    minWidth: '5.25rem',
                    padding: '0.2rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    position: 'relative',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'box-shadow 180ms ease, transform 180ms ease',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    ...style,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <span
                    aria-hidden
                    style={{
                        position: 'absolute',
                        top: '0.2rem',
                        left: '0.2rem',
                        width: 'calc(50% - 0.2rem)',
                        height: 'calc(100% - 0.4rem)',
                        borderRadius: '999px',
                        backgroundColor: '#000',
                        transform: isEn ? 'translateX(100%)' : 'translateX(0%)',
                        transition: prefersReducedMotion
                            ? 'none'
                            : 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}
                />

                <span
                    style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        letterSpacing: '0.04em',
                        zIndex: 1,
                        color: isEn ? 'rgba(0,0,0,0.55)' : '#bff104',
                        transition: 'color 180ms ease',
                    }}
                >
                    FR
                </span>
                <span
                    style={{
                        flex: 1,
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        letterSpacing: '0.04em',
                        zIndex: 1,
                        color: isEn ? '#bff104' : 'rgba(0,0,0,0.55)',
                        transition: 'color 180ms ease',
                    }}
                >
                    EN
                </span>
            </button>
        );
    }

    const baseStyle: CSSProperties = {};

    const label = (
        <span
            style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                alignItems: 'center',
                width: '100%',
                maxWidth: '4.6rem',
                margin: '0 auto',
                height: '100%',
            }}
        >
            {/* Animated underline (50% width, slides between columns) */}
            <span
                aria-hidden
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '-0.2rem',
                    height: '2px',
                    borderRadius: '999px',
                    background: (() => {
                        const color = isHovered || isFocused ? '#000' : '#bff104';
                        return `linear-gradient(to right, transparent 0%, transparent 15%, ${color} 15%, ${color} 85%, transparent 85%, transparent 100%)`;
                    })(),
                    width: '50%',
                    transform: `translateX(${locale === 'en' ? '100%' : '0%'})`,
                    transition: prefersReducedMotion
                        ? 'none'
                        : 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
            />

            <span
                style={{
                    textAlign: 'center',
                    zIndex: 1,
                    opacity: locale === 'fr' ? 1 : 0.35,
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                }}
            >
                FR
            </span>
            <span
                style={{
                    textAlign: 'center',
                    zIndex: 1,
                    opacity: locale === 'en' ? 1 : 0.35,
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                }}
            >
                EN
            </span>
        </span>
    );

    return (
        <span
            className="language-toggle"
            style={{display: 'inline-flex', width: isMobileWidth ? '100%' : undefined}}
            onMouseEnter={() => { if (canHover) setIsHovered(true); }}
            onMouseLeave={() => { if (canHover) setIsHovered(false); }}
            onFocus={() => { if (canHover) setIsFocused(true); }}
            onBlur={() => { if (canHover) setIsFocused(false); }}
        >
            <NeonButton
                label={label}
                onClick={toggleLocale}
                blurOnClick
                variant="outline"
                title={tooltipText}
                disableOutlineHover={!canHover}
                subtleHover={false}
                className="language-toggle-btn"
                style={{
                    // On mobile take full width
                    width: isMobileWidth ? '100%' : undefined,
                    minWidth: isMobileWidth ? undefined : '6.2rem',
                    ...baseStyle,
                    ...style,
                }}
                // Prevent hover/focus visual effects on devices without hover
                onMouseEnter={canHover ? undefined : (() => { /* no-op on touch */ })}
                onMouseLeave={canHover ? undefined : (() => { /* no-op on touch */ })}
                onFocus={canHover ? undefined : ((e: React.FocusEvent<HTMLButtonElement>) => { (e.currentTarget as HTMLButtonElement).blur(); })}
                onBlur={canHover ? undefined : (() => { /* no-op */ })}
             />
         </span>
     );
 }
