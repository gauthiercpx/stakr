import {useEffect, useMemo, useRef, useState} from 'react';
import type {Location} from 'react-router-dom';
import {Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {AnimatePresence} from "framer-motion";

// API & Client
import {api, ACCESS_TOKEN_KEY, clearAuthTokens} from './api/client';

// Pages
import Login from './pages/Login';
import Signup from './pages/signup/Signup';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import About from './pages/About/About.tsx';

// Components
import ServerWakingUp from './components/ServerWakingUp';
import Modal from './components/Modal';
import PageTransition from './components/PageTransition';
import {useI18n} from './i18n/useI18n';
import Toast from './components/Toast';
import ToastHost from './components/ToastHost';
import AppLayout from './layouts/AppLayout';
import FadeIn from "./components/animations/FadeIn.tsx";

// --- HELPERS ---
function RequireAuth({isAuthenticated, redirectTo, children, isLoggingOut}: any) {
    if (isLoggingOut) return <Navigate to="/" replace/>;
    if (!isAuthenticated) return <Navigate to="/login" replace state={{from: redirectTo}}/>;
    return <>{children}</>;
}

function hasFrom(state: any): boolean {
    return state && typeof state === 'object' && 'from' in state;
}

function hasBackground(state: any): boolean {
    return state && typeof state === 'object' && 'backgroundLocation' in state;
}

// --- MAIN COMPONENT ---
function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const {t} = useI18n();

    // -- AUTH STATES --
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem(ACCESS_TOKEN_KEY));
    const [isServerReady, setIsServerReady] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // -- UI STATES --
    const [showSignedOutToast, setShowSignedOutToast] = useState(false);
    const [showAccountCreatedToast, setShowAccountCreatedToast] = useState(false);

    // -- MODAL ANIMATION LOGIC --
    const targetSize = location.pathname === '/signup' ? 'lg' : 'sm';
    const [activeModalSize, setActiveModalSize] = useState<'sm' | 'lg'>(targetSize);

    // Extraction du background location
    const backgroundLocation = useMemo(() => {
        const maybeBg = hasBackground(location.state) ? location.state.backgroundLocation : undefined;
        return maybeBg && typeof maybeBg === 'object' ? maybeBg : undefined;
    }, [location.state]);

    // ⚡️ SYNC DE LA TAILLE : On réinitialise quand la modale est fermée
    useEffect(() => {
        if (!backgroundLocation) {
            setActiveModalSize(targetSize);
        }
    }, [backgroundLocation, targetSize]);

    // Ping server until it reports ready
    useEffect(() => {
        let cancelled = false;
        const pingReady = async () => {
            try {
                await api.get('/ready');
                if (!cancelled) setIsServerReady(true);
            } catch {
                if (!cancelled) window.setTimeout(pingReady, 1500);
            }
        };
        pingReady();
        return () => { cancelled = true; };
    }, []);

    const logout = () => {
        setIsLoggingOut(true);
        clearAuthTokens();
        setIsAuthenticated(false);
        setShowSignedOutToast(true);
        navigate('/', {replace: true, state: {}});
    };

    useEffect(() => {
        if (location.pathname !== '/') return;
        const id = window.setTimeout(() => setIsLoggingOut(false), 0);
        return () => window.clearTimeout(id);
    }, [location.pathname]);

    const redirectTo = useMemo(() => {
        const maybeFrom = hasFrom(location.state) ? location.state.from?.pathname : undefined;
        return typeof maybeFrom === 'string' ? maybeFrom : '/dashboard';
    }, [location.state]);

    const redirectToRef = useRef<string>(redirectTo);
    useEffect(() => { redirectToRef.current = redirectTo; }, [redirectTo]);

    if (!isServerReady) return <ServerWakingUp/>;

    const routesLocation = backgroundLocation ?? location;
    const transitionKey = backgroundLocation ? (backgroundLocation as Location).pathname : location.pathname;

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        navigate(redirectToRef.current, {replace: true});
    };

    const handleSignupSuccess = () => {
        setIsAuthenticated(true);
        setShowAccountCreatedToast(true);
        navigate('/dashboard', {replace: true});
    }

    return (
        <>
            {showAccountCreatedToast && (
                <ToastHost>
                    <Toast message={t('common.accountCreated')} onDone={() => setShowAccountCreatedToast(false)}/>
                </ToastHost>
            )}
            {showSignedOutToast && (
                <ToastHost>
                    <Toast message={t('common.signedOut')} onDone={() => setShowSignedOutToast(false)}/>
                </ToastHost>
            )}

            <AppLayout
                isAuthenticated={isAuthenticated}
                onLogout={logout}
                onLoginRequested={() => navigate('/login', {state: {backgroundLocation: location}})}
                onSignupRequested={() => navigate('/signup', {state: {backgroundLocation: location}})}
            >
                <PageTransition transitionKey={transitionKey}>
                    <Routes location={routesLocation as Location}>
                        <Route path="/" element={
                            isAuthenticated ? <Navigate to="/dashboard" replace/> :
                                <LandingPage
                                    onLoginRequested={() => navigate('/login', {state: {backgroundLocation: location}})}
                                    onSignupRequested={() => navigate('/signup', {state: {backgroundLocation: location}})}
                                />
                        }/>
                        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace/> : <Login onLoginSuccess={handleLoginSuccess}/>}/>
                        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace/> : <Signup onSignupSuccess={handleSignupSuccess}/>}/>
                        <Route path="/dashboard" element={
                            <RequireAuth isAuthenticated={isAuthenticated} redirectTo={location} isLoggingOut={isLoggingOut}>
                                <Dashboard onLogout={logout}/>
                            </RequireAuth>
                        }/>
                        <Route path="*" element={<NotFound/>}/>
                        <Route path="/about" element={<About/>}/>
                    </Routes>
                </PageTransition>
            </AppLayout>

            {/* --- MODAL SYSTEM --- */}
            <AnimatePresence>
                {backgroundLocation && !isAuthenticated && (
                    <Modal
                        key="modal-stable-container"
                        isOpen
                        onRequestClose={() => navigate(backgroundLocation.pathname)}
                        size={activeModalSize}
                    >
                        <AnimatePresence
                            mode="wait"
                            initial={false}
                            onExitComplete={() => {
                                // On ne change la taille que lorsque le contenu précédent a disparu
                                setActiveModalSize(targetSize);
                            }}
                        >
                            <Routes location={location} key={location.pathname}>
                                <Route
                                    path="/login"
                                    element={
                                        <FadeIn direction="none" fullWidth>
                                            <Login
                                                onLoginSuccess={handleLoginSuccess}
                                                onSignupRequested={() => navigate('/signup', {state: {backgroundLocation}})}
                                            />
                                        </FadeIn>
                                    }
                                />
                                <Route
                                    path="/signup"
                                    element={
                                        <FadeIn direction="none" fullWidth>
                                            <Signup
                                                onSignupSuccess={handleSignupSuccess}
                                                onLoginRequested={() => navigate('/login', {state: {backgroundLocation}})}
                                            />
                                        </FadeIn>
                                    }
                                />
                            </Routes>
                        </AnimatePresence>
                    </Modal>
                )}
            </AnimatePresence>
        </>
    );
}

export default App;