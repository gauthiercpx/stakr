import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useI18n } from '../i18n/useI18n';
import FadeIn from '../components/animations/FadeIn';
import NeonButton from '../components/NeonButton'; // Gardé uniquement pour le bouton "Create Stacks"

interface User {
    id: number;
    email: string;
    first_name: string;
    is_active: boolean;
}

interface DashboardProps {
    onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
    const { t } = useI18n();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get('auth/users/me')
            .then((response) => {
                setUser(response.data);
                setLoading(false);
            })
            .catch((error) => {
                if (import.meta.env.DEV) {
                    console.error('Session error:', error);
                }
                onLogout();
            });
    }, [onLogout]);

    return (
        /* 👇 On a enlevé le wrapper avec minHeight et fond gris car le Layout s'en occupe */
        <main style={{ padding: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
            {loading ? (
                <FadeIn direction="none">
                    <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>
                        {t('common.loading')}
                    </div>
                </FadeIn>
            ) : (
                <>
                    <FadeIn>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#000' }}>
                            {t('dashboard.greeting')}{' '}
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
                                {user?.first_name || user?.email.split('@')[0]}
                            </span>{' '}
                            👋
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.1}>
                        <p style={{ color: '#666', marginBottom: '3rem', fontSize: '1.1rem' }}>
                            {t('dashboard.subtitle')}
                        </p>
                    </FadeIn>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '2rem',
                        }}
                    >
                        <FadeIn delay={0.2} fullWidth>
                            <div
                                style={{
                                    backgroundColor: 'white',
                                    padding: '2rem',
                                    borderRadius: '1.5rem',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    height: '100%'
                                }}
                            >
                                <h3
                                    style={{
                                        marginTop: 0,
                                        color: '#999',
                                        fontSize: '0.8rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                    }}
                                >
                                    {t('dashboard.account.title')}
                                </h3>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '10px' }}>
                                    #{user?.id}
                                </div>
                                <div
                                    style={{
                                        display: 'inline-block',
                                        marginTop: '15px',
                                        padding: '5px 12px',
                                        backgroundColor: user?.is_active ? '#e6fffa' : '#fff5f5',
                                        color: user?.is_active ? '#00b894' : '#ff7675',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    {user?.is_active
                                        ? t('dashboard.account.status.active')
                                        : t('dashboard.account.status.inactive')}
                                </div>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.3} fullWidth>
                            <div
                                style={{
                                    backgroundColor: '#000',
                                    color: 'white',
                                    padding: '2rem',
                                    borderRadius: '1.5rem',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '100%'
                                }}
                            >
                                <div>
                                    <h3
                                        style={{
                                            marginTop: 0,
                                            color: '#bff104',
                                            fontSize: '0.8rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                        }}
                                    >
                                        {t('dashboard.stacks.title')}
                                    </h3>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '10px' }}>0
                                    </div>
                                </div>

                                <NeonButton
                                    label={t('dashboard.stacks.create')}
                                    disabled
                                    title={t('common.comingSoon')}
                                    variant="solid"
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#bff104',
                                        color: '#000',
                                        boxShadow: 'none',
                                        marginTop: '20px'
                                    }}
                                />
                            </div>
                        </FadeIn>
                    </div>
                </>
            )}
        </main>
    );
}