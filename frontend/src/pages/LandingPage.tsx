import LanguageToggle from '../components/LanguageToggle';
import NeonButton from '../components/NeonButton';
import {useI18n} from '../i18n/useI18n';
import {Link} from 'react-router-dom';
import {useEffect, useId, useRef, useState} from 'react';

interface LandingPageProps {
    onLoginRequested: () => void;
}

export default function LandingPage({onLoginRequested}: LandingPageProps) {
    const {t} = useI18n();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuId = useId();
    const mobilePanelId = `stakr-mobile-menu-${menuId}`;
    const burgerButtonRef = useRef<HTMLButtonElement | null>(null);
    const mobilePanelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isMenuOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
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
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('pointerdown', onPointerDown);
        return () => window.removeEventListener('pointerdown', onPointerDown);
    }, [isMenuOpen]);

    useEffect(() => {
        if (isMenuOpen) return;
        // When closing, give focus back to the burger button (keyboard users).
        burgerButtonRef.current?.focus();
    }, [isMenuOpen]);

    const pillStyle: React.CSSProperties = {
        padding: '0.6rem 0.95rem',
        minHeight: '40px',
        minWidth: 'min(18rem, 100%)',
        borderRadius: '0.9rem',
        border: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: 'white',
        color: '#333',
        fontWeight: 700,
        fontSize: '0.95rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        boxSizing: 'border-box',
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#f4f4f4',
                fontFamily: "'Baloo 2', cursive",
            }}
        >
            <nav className="stakr-nav">
                <Link
                    to="/"
                    className="stakr-nav__brand"
                    aria-label="Go to home"
                >
                    STAKR<span style={{color: '#bff104'}}>.</span>
                </Link>

                {/* Desktop actions */}
                <div className="stakr-nav__desktop">
                    <LanguageToggle/>

                    <NeonButton
                        label={t('nav.signup')}
                        disabled
                        title={t('common.comingSoon')}
                        variant="outline"
                        style={{minWidth: '10.5rem'}}
                    />

                    <NeonButton
                        label={t('nav.login')}
                        onClick={onLoginRequested}
                        variant="outline"
                        style={{minWidth: '10.5rem'}}
                    />
                </div>

                {/* Mobile burger */}
                <button
                    type="button"
                    className="stakr-nav__burgerBtn"
                    aria-label="Menu"
                    aria-expanded={isMenuOpen}
                    aria-controls={mobilePanelId}
                    ref={burgerButtonRef}
                    onClick={() => setIsMenuOpen((v) => !v)}
                >
                    <span className="stakr-nav__burgerLines" aria-hidden>
                        <span />
                        <span />
                        <span />
                    </span>
                </button>

                <div
                    id={mobilePanelId}
                    ref={mobilePanelRef}
                    className={`stakr-nav__mobilePanel ${isMenuOpen ? 'is-open' : ''}`}
                    role="menu"
                    aria-label="Mobile menu"
                >
                    <div className="stakr-nav__mobileRow">
                        <NeonButton
                            label={t('nav.signup')}
                            disabled
                            title={t('common.comingSoon')}
                            variant="outline"
                            style={{width: '100%'}}
                        />
                        <NeonButton
                            label={t('nav.login')}
                            onClick={() => {
                                setIsMenuOpen(false);
                                onLoginRequested();
                            }}
                            variant="outline"
                            style={{width: '100%'}}
                        />

                        {/* Language toggle last */}
                        <LanguageToggle style={{width: '100%'}} />
                    </div>
                </div>
            </nav>

            <main style={{padding: '3rem 2rem 4rem', maxWidth: '1100px', margin: '0 auto'}}>
                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2.5rem',
                        alignItems: 'center',
                        marginBottom: '3.5rem',
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontSize: 'clamp(2.1rem, 3.6vw, 2.8rem)',
                                lineHeight: 1.05,
                                marginBottom: '1rem',
                                color: '#000',
                                maxWidth: '34rem',
                                textWrap: 'balance',
                            }}
                        >
                            {t('landing.hero.title.line1')}
                            <br />
                             <span
                                 style={{
                                     display: 'inline-flex',
                                     alignItems: 'baseline',
                                     gap: '0.35rem',
                                     whiteSpace: 'nowrap',
                                 }}
                             >
                                 <span
                                     style={{
                                         color: '#000',
                                         backgroundColor: '#bff104',
                                         padding: '0 0.35rem',
                                         display: 'inline-block',
                                         lineHeight: 1,
                                         verticalAlign: 'baseline',
                                         borderRadius: '0.2rem',
                                     }}
                                 >
                                     {t('landing.hero.title.brand')}
                                 </span>
                                 <span style={{display: 'inline-block'}}>{t('landing.hero.title.after')}</span>
                             </span>
                         </h1>
                        <p
                            style={{
                                color: '#666',
                                fontSize: 'clamp(1.0rem, 1.4vw, 1.1rem)',
                                marginBottom: '2rem',
                            }}
                        >
                            {t('landing.hero.subtitle')}
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '1rem',
                                flexWrap: 'wrap',
                                width: '100%',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    width: '100%',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        gap: '0.6rem',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        justifyContent: 'center',
                                    }}
                                >
                                     <NeonButton
                                         label={t('landing.cta.signup')}
                                         disabled
                                         title={t('common.comingSoon')}
                                         variant="solid"
                                         style={{
                                             backgroundColor: '#bff104',
                                             color: '#000',
                                             minWidth: 'clamp(9rem, 40vw, 10.5rem)',
                                         }}
                                     />

                                     <NeonButton
                                         label={t('landing.cta.login')}
                                         onClick={onLoginRequested}
                                         variant="solid"
                                         style={{minWidth: 'clamp(9rem, 40vw, 10.5rem)'}}
                                     />
                                </div>
                             </div>

                            <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                                <div style={pillStyle}>{t('landing.cta.dashboardReady')}</div>
                            </div>
                         </div>
                    </div>

                    <div
                        style={{
                            backgroundColor: '#000',
                            color: 'white',
                            padding: '2.5rem',
                            borderRadius: '1.8rem',
                            boxShadow: '0 14px 32px rgba(0,0,0,0.3)',
                        }}
                    >
                        <h2 style={{marginTop: 0, color: '#bff104', fontSize: '0.9rem'}}>
                            {t('landing.preview.title')}
                        </h2>
                        <div style={{fontSize: '2.6rem', fontWeight: 800, margin: '0.5rem 0 1.5rem'}}>
                            0
                        </div>
                        <p
                            style={{
                                color: '#d1d1d1',
                                marginBottom: '1.5rem',
                                maxWidth: '22rem',
                                lineHeight: 1.35,
                                minHeight: '2.7em',
                            }}
                        >
                            {t('landing.preview.desc')}
                        </p>
                        <NeonButton
                            label={t('landing.preview.cta')}
                            onClick={onLoginRequested}
                            variant="solid"
                            style={{
                                width: '100%',
                                backgroundColor: '#bff104',
                                color: '#000',
                            }}
                        />
                    </div>
                </section>

                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '1.8rem',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '1.4rem',
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 10px 24px rgba(0,0,0,0.05)',
                        }}
                    >
                        <h3 style={{marginTop: 0, color: '#000', fontSize: '1.2rem'}}>{t('landing.features.focus.title')}</h3>
                        <p style={{color: '#666'}}>{t('landing.features.focus.desc')}</p>
                    </div>
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '1.4rem',
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 10px 24px rgba(0,0,0,0.05)',
                        }}
                    >
                        <h3 style={{marginTop: 0, color: '#000', fontSize: '1.2rem'}}>
                            {t('landing.features.fast.title')}
                        </h3>
                        <p style={{color: '#666'}}>{t('landing.features.fast.desc')}</p>
                    </div>
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '1.4rem',
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 10px 24px rgba(0,0,0,0.05)',
                        }}
                    >
                        <h3 style={{marginTop: 0, color: '#000', fontSize: '1.2rem'}}>
                            {t('landing.features.ready.title')}
                        </h3>
                        <p style={{color: '#666'}}>{t('landing.features.ready.desc')}</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
