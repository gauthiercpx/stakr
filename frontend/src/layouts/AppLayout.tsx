import {type ReactNode} from 'react';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import NeonButton from '../components/NeonButton';
import LanguageToggle from '../components/LanguageToggle';
import FadeText from '../components/FadeText';
import {useI18n} from '../i18n/useI18n';

interface AppLayoutProps {
    children: ReactNode;
    isAuthenticated: boolean;
    onLogout: () => void;
    onLoginRequested: () => void;
    onSignupRequested: () => void;
}

export default function AppLayout({
                                      children,
                                      isAuthenticated,
                                      onLogout,
                                      onLoginRequested,
                                      onSignupRequested
                                  }: AppLayoutProps) {
    const {t} = useI18n();
    const brandLink = isAuthenticated ? "/dashboard" : "/";


    const desktopActions = isAuthenticated ? (
        <>
            <LanguageToggle/>
            <NeonButton
                label={<FadeText>{t('nav.logout')}</FadeText>}
                onClick={onLogout}
                variant="outline"
                style={{minWidth: '10rem'}}
            />
        </>
    ) : (
        <>
            <LanguageToggle/>
            <NeonButton
                label={<FadeText>{t('nav.signup')}</FadeText>}
                onClick={onSignupRequested}
                title={t('landing.cta.signup')}
                variant="outline"
                style={{minWidth: '10rem'}}
            />
            <NeonButton
                label={<FadeText>{t('nav.login')}</FadeText>}
                onClick={onLoginRequested}
                variant="outline"
                style={{minWidth: '10rem'}}
            />
        </>
    );

    const mobileActions = ({closeMenu}: { closeMenu: () => void }) => (
        isAuthenticated ? (
            <>
                {/* Pour fermer le menu, on garde une petite fonction fléchée, c'est ok */}
                <NeonButton
                    label={<FadeText>{t('nav.logout')}</FadeText>}
                    onClick={() => {
                        onLogout();
                        closeMenu();
                    }}
                    variant="outline"
                    style={{width: '100%'}}
                />
                <LanguageToggle style={{width: '100%'}}/>
            </>
        ) : (
            <>
                <NeonButton
                    label={<FadeText>{t('nav.signup')}</FadeText>}
                    onClick={() => {
                        onSignupRequested();
                        closeMenu();
                    }}
                    variant="outline"
                    style={{width: '100%'}}
                />
                <NeonButton
                    label={<FadeText>{t('nav.login')}</FadeText>}
                    onClick={() => {
                        onLoginRequested();
                        closeMenu();
                    }}
                    variant="outline"
                    style={{width: '100%'}}
                />
                <LanguageToggle style={{width: '100%'}}/>
            </>
        )
    );

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f4f4f4',
            fontFamily: "'Baloo 2', cursive",
            paddingTop: '5.5rem',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <AppNavbar
                desktopActions={desktopActions}
                mobileActions={mobileActions}
                brandTo={brandLink}
            />
            <div style={{flex: 1}}>
                {children}
            </div>
            <Footer/>
        </div>
    );
}