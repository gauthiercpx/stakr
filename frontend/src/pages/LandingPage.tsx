import React from 'react';
import NeonButton from '../components/NeonButton';
import {useI18n} from '../i18n/useI18n';
import FadeIn from '../components/animations/FadeIn'; // 👈 On importe l'animation

interface LandingPageProps {
    onLoginRequested: () => void;
    onSignupRequested: () => void;
}

export default function LandingPage({onLoginRequested, onSignupRequested}: LandingPageProps) {
    const {t} = useI18n();

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


            <main style={{padding: '3rem 2rem 4rem', maxWidth: '1100px', margin: '0 auto'}}>

                {/* SECTION HÉROS */}
                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '2.5rem',
                        alignItems: 'center',
                        marginBottom: '3.5rem',
                    }}
                >
                    {/* Colonne Gauche (Textes) */}
                    <div>
                        {/* 1. Titre (Immédiat) */}
                        <FadeIn>
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
                                <br/>
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
                                        <span
                                            style={{
                                                color: '#fff',
                                                backgroundColor: 'transparent',
                                                padding: '0 0.15rem',
                                                display: 'inline-block',
                                                lineHeight: 1,
                                                verticalAlign: 'baseline',
                                                borderRadius: '0.2rem',
                                                marginLeft: '0',
                                            }}
                                        >
                                            .
                                        </span>
                                    </span>

                                    <span style={{display: 'inline-block'}}>{t('landing.hero.title.after')}</span>

                                </span>
                            </h1>
                        </FadeIn>

                        {/* 2. Sous-titre (Délai 0.1s) */}
                        <FadeIn delay={0.1}>
                            <p
                                style={{
                                    color: '#666',
                                    fontSize: 'clamp(1.0rem, 1.4vw, 1.1rem)',
                                    marginBottom: '2rem',
                                }}
                            >
                                {t('landing.hero.subtitle')}
                            </p>
                        </FadeIn>

                        {/* 3. Boutons d'action (Délai 0.2s) */}
                        <FadeIn delay={0.2}>
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
                                            onClick={onSignupRequested}
                                            title={t('landing.cta.signup')}
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
                        </FadeIn>
                    </div>

                    {/* Colonne Droite (Carte Preview) - Délai 0.3s */}
                    <FadeIn delay={0.3} fullWidth>
                        <div
                            style={{
                                backgroundColor: '#000',
                                color: 'white',
                                padding: '2.5rem',
                                borderRadius: '1.8rem',
                                boxShadow: '0 14px 32px rgba(0,0,0,0.3)',
                                height: '100%' // Assure que l'animation prend toute la hauteur
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
                    </FadeIn>
                </section>

                {/* SECTION FEATURES (Cascade 0.4s -> 0.6s) */}
                <section
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: '1.8rem',
                    }}
                >
                    <FadeIn delay={0.4} fullWidth>
                        <div
                            style={{
                                backgroundColor: 'white',
                                padding: '2rem',
                                borderRadius: '1.4rem',
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 10px 24px rgba(0,0,0,0.05)',
                                height: '100%'
                            }}
                        >
                            <h3 style={{
                                marginTop: 0,
                                color: '#000',
                                fontSize: '1.2rem'
                            }}>{t('landing.features.focus.title')}</h3>
                            <p style={{color: '#666'}}>{t('landing.features.focus.desc')}</p>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.5} fullWidth>
                        <div
                            style={{
                                backgroundColor: 'white',
                                padding: '2rem',
                                borderRadius: '1.4rem',
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 10px 24px rgba(0,0,0,0.05)',
                                height: '100%'
                            }}
                        >
                            <h3 style={{marginTop: 0, color: '#000', fontSize: '1.2rem'}}>
                                {t('landing.features.fast.title')}
                            </h3>
                            <p style={{color: '#666'}}>{t('landing.features.fast.desc')}</p>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.6} fullWidth>
                        <div
                            style={{
                                backgroundColor: 'white',
                                padding: '2rem',
                                borderRadius: '1.4rem',
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 10px 24px rgba(0,0,0,0.05)',
                                height: '100%'
                            }}
                        >
                            <h3 style={{marginTop: 0, color: '#000', fontSize: '1.2rem'}}>
                                {t('landing.features.ready.title')}
                            </h3>
                            <p style={{color: '#666'}}>{t('landing.features.ready.desc')}</p>
                        </div>
                    </FadeIn>
                </section>
            </main>
        </div>
    );
}