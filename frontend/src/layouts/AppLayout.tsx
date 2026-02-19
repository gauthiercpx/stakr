import {type ReactNode} from 'react';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import NeonButton from '../components/NeonButton';
import LanguageToggle from '../components/LanguageToggle';
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
                label={t('nav.logout')}
                onClick={onLogout}
                variant="outline"
                style={{minWidth: '10 rem'}}
            />
        </>
    ) : (
        <>
            <LanguageToggle/>
            <NeonButton
                label={t('nav.signup')}
                onClick={onSignupRequested}
                title={t('landing.cta.signup')}
                variant="outline"
                style={{minWidth: '10rem'}}
            />
            <NeonButton
                label={t('nav.login')}
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
                    label={t('nav.logout')}
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
                    label={t('nav.signup')}
                    onClick={() => {
                        onSignupRequested();
                        closeMenu();
                    }}
                    variant="outline"
                    style={{width: '100%'}}
                />
                <NeonButton
                    label={t('nav.login')}
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