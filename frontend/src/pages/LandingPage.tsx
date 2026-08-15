import React, {useLayoutEffect, useRef, useState} from 'react';
import NeonButton from '../components/NeonButton';
import FadeText from '../components/FadeText';
import {useI18n} from '../i18n/useI18n';
import FadeIn from '../components/animations/FadeIn';

interface LandingPageProps {
    onLoginRequested: () => void;
    onSignupRequested: () => void;
}

export default function LandingPage({onLoginRequested, onSignupRequested}: LandingPageProps) {
    const {t, locale} = useI18n();

    // The headline wraps to a different number of lines depending on the
    // language, which would otherwise snap everything below it into place.
    // Measure its natural height on each locale change and ease the wrapper
    // to it with a plain CSS transition (no framer-motion — nesting a
    // `layout`-animated element inside FadeIn's own transform animation
    // caused it to interfere with unrelated entrance animations elsewhere
    // on the page). overflow stays visible so an imprecise measurement can
    // never clip the text, only leave a brief overlap.
    const heroTitleRef = useRef<HTMLHeadingElement>(null);
    const [heroTitleHeight, setHeroTitleHeight] = useState<number>();

    const measureHeroTitle = () => {
        if (heroTitleRef.current) {
            setHeroTitleHeight(Math.ceil(heroTitleRef.current.getBoundingClientRect().height) + 6);
        }
    };

    useLayoutEffect(measureHeroTitle, [locale]);

    // The custom font may still be loading at first measurement, giving a
    // too-small height from the fallback font's metrics; re-measure once it
    // settles.
    useLayoutEffect(() => {
        if (typeof document === 'undefined' || !document.fonts) {
            return;
        }
        let cancelled = false;
        document.fonts.ready.then(() => {
            if (!cancelled) {
                measureHeroTitle();
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    // The "STAKR. ✨" row sits below line1 within the same <h1>, so its own
    // vertical position (not just the wrapper's overall height) shifts
    // whenever line1's line count changes between languages. The wrapper's
    // height transition doesn't touch that internal position, so FLIP it by
    // hand: measure where the row used to be, snap it there with a
    // transform, then transition that transform back to zero.
    const stakrRowRef = useRef<HTMLSpanElement>(null);
    const prevStakrTopRef = useRef<number | null>(null);

    useLayoutEffect(() => {
        const el = stakrRowRef.current;
        if (!el) {
            return;
        }

        const newTop = el.getBoundingClientRect().top;
        const prevTop = prevStakrTopRef.current;

        if (prevTop !== null) {
            const deltaY = prevTop - newTop;
            if (deltaY !== 0) {
                el.style.transition = 'none';
                el.style.transform = `translateY(${deltaY}px)`;
                // Force a reflow so the browser registers the starting
                // transform before we animate it away.
                void el.getBoundingClientRect();
                requestAnimationFrame(() => {
                    el.style.transition = 'transform 300ms ease';
                    el.style.transform = '';
                });
            }
        }

        prevStakrTopRef.current = newTop;
    }, [locale]);

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
                        <FadeIn>
                            <div
                                style={{
                                    height: heroTitleHeight,
                                    overflow: 'visible',
                                    transition: 'height 300ms ease',
                                    marginBottom: '1rem',
                                }}
                            >
                                <h1
                                    ref={heroTitleRef}
                                    style={{
                                        fontSize: 'clamp(2.1rem, 3.6vw, 2.8rem)',
                                        lineHeight: 1.05,
                                        color: '#000',
                                        maxWidth: '42rem',
                                    }}
                                >
                                    <FadeText as="span" style={{display: 'block', textWrap: 'balance'}}>
                                        {t('landing.hero.title.line1')}
                                    </FadeText>

                                    <span
                                        ref={stakrRowRef}
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            alignItems: 'baseline',
                                            gap: '0.35rem',
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: '#000',
                                                backgroundColor: '#bff104',
                                                padding: '0 0.35rem',
                                                display: 'inline-block',
                                                lineHeight: 1,
                                                borderRadius: '0.2rem',
                                            }}
                                        >
                                            <FadeText as="span">{t('landing.hero.title.brand')}</FadeText>
                                            <span
                                                style={{
                                                    color: '#fff',
                                                    backgroundColor: 'transparent',
                                                    padding: '0 0.15rem',
                                                    display: 'inline-block',
                                                    lineHeight: 1,
                                                    borderRadius: '0.2rem',
                                                }}
                                            >
                                                .
                                            </span>
                                        </span>

                                        <FadeText as="span">{t('landing.hero.title.after')}</FadeText>
                                    </span>
                                </h1>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.1}>
                            <p
                                style={{
                                    color: '#666',
                                    fontSize: 'clamp(1.0rem, 1.4vw, 1.1rem)',
                                    marginBottom: '2rem',
                                }}
                            >
                                <FadeText>{t('landing.hero.subtitle')}</FadeText>
                            </p>
                        </FadeIn>

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
                                            label={<FadeText>{t('landing.cta.signup')}</FadeText>}
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
                                            label={<FadeText>{t('landing.cta.login')}</FadeText>}
                                            onClick={onLoginRequested}
                                            variant="solid"
                                            style={{minWidth: 'clamp(9rem, 40vw, 10.5rem)'}}
                                        />
                                    </div>
                                </div>

                                <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
                                    <FadeText style={{...pillStyle, display: 'inline-flex'}}>{t('landing.cta.dashboardReady')}</FadeText>
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    <FadeIn delay={0.3} fullWidth>
                        <div
                            style={{
                                backgroundColor: '#000',
                                color: 'white',
                                padding: '2.5rem',
                                borderRadius: '1.8rem',
                                boxShadow: '0 14px 32px rgba(0,0,0,0.3)',
                                height: '100%'
                            }}
                        >
                            <h2 style={{marginTop: 0, color: '#bff104', fontSize: '0.9rem'}}>
                                <FadeText>{t('landing.preview.title')}</FadeText>
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
                                <FadeText>{t('landing.preview.desc')}</FadeText>
                            </p>
                            <NeonButton
                                label={<FadeText>{t('landing.preview.cta')}</FadeText>}
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
                            }}><FadeText>{t('landing.features.focus.title')}</FadeText></h3>
                            <p style={{color: '#666'}}><FadeText>{t('landing.features.focus.desc')}</FadeText></p>
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
                                <FadeText>{t('landing.features.fast.title')}</FadeText>
                            </h3>
                            <p style={{color: '#666'}}><FadeText>{t('landing.features.fast.desc')}</FadeText></p>
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
                                <FadeText>{t('landing.features.ready.title')}</FadeText>
                            </h3>
                            <p style={{color: '#666'}}><FadeText>{t('landing.features.ready.desc')}</FadeText></p>
                        </div>
                    </FadeIn>
                </section>
            </main>
        </div>
    );
}