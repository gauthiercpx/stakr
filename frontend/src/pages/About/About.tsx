import {Link} from 'react-router-dom';
import {useI18n} from '../../i18n/useI18n.ts';
import AppNavbar from '../../components/AppNavbar.tsx';
import LanguageToggle from "../../components/LanguageToggle.tsx";
import FadeText from '../../components/FadeText.tsx';

export default function About() {
    const {t} = useI18n();

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#f4f4f4',
                fontFamily: "'Baloo 2', cursive",
            }}
        >
            <AppNavbar
                desktopActions={<LanguageToggle style={{width: '100%'}}/>
                } mobileActions={({}) => (
                <>

                    <LanguageToggle style={{width: '100%'}}/>
                </>
            )}/>

            <main style={{padding: '3rem', maxWidth: '900px', margin: '0 auto'}}>
                <h1 style={{marginTop: 0}}><FadeText>{t('about.title')}</FadeText></h1>
                <p style={{color: '#666', lineHeight: 1.5}}><FadeText>{t('about.description')}</FadeText></p>

                <section style={{marginTop: '2rem'}}>
                    <h2 style={{marginBottom: '0.5rem'}}><FadeText>{t('about.valuesTitle')}</FadeText></h2>
                    <ul>
                        <li><FadeText>{t('about.value1')}</FadeText></li>
                        <li><FadeText>{t('about.value2')}</FadeText></li>
                        <li><FadeText>{t('about.value3')}</FadeText></li>
                    </ul>
                </section>

                <div style={{marginTop: '2.5rem'}}>
                    <Link to="/">← <FadeText as="span">{t('about.backHome')}</FadeText></Link>
                </div>
            </main>
        </div>
    );
}
