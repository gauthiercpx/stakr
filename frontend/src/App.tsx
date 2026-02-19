import {useEffect, useMemo, useRef, useState} from 'react';
import type {Location} from 'react-router-dom';
import {Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/signup/Signup';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import {api, ACCESS_TOKEN_KEY, clearAuthTokens} from './api/client';
import ServerWakingUp from './components/ServerWakingUp';
import Modal from './components/Modal';
import PageTransition from './components/PageTransition';
import {useI18n} from './i18n/useI18n';
import Toast from './components/Toast';
import ToastHost from './components/ToastHost';
import About from './pages/About/About.tsx';
import AppLayout from './layouts/AppLayout';

// Utility helpers for auth and routing (kept inline for clarity)
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

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const {t} = useI18n();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem(ACCESS_TOKEN_KEY));
    const [isServerReady, setIsServerReady] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showSignedOutToast, setShowSignedOutToast] = useState(false);
    const [showAccountCreatedToast, setShowAccountCreatedToast] = useState(false);

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
        return () => {
            cancelled = true;
        };
    }, []);

    const logout = () => {
        setIsLoggingOut(true);
        clearAuthTokens();
        setIsAuthenticated(false);
        setShowSignedOutToast(true);
        navigate('/', {replace: true, state: {}});
    };

    // Clear logout flag shortly after returning to home
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
    useEffect(() => {
        redirectToRef.current = redirectTo;
    }, [redirectTo]);

    const backgroundLocation = useMemo(() => {
        const maybeBg = hasBackground(location.state) ? location.state.backgroundLocation : undefined;
        return maybeBg && typeof maybeBg === 'object' ? maybeBg : undefined;
    }, [location.state]);

    if (!isServerReady) return <ServerWakingUp/>;

    const routesLocation = backgroundLocation ?? location; // use background location for modal routes
    const transitionKey = backgroundLocation ? (backgroundLocation as Location).key : location.key;

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

            {/* App layout wraps the whole application */}
            <AppLayout
                isAuthenticated={isAuthenticated}
                onLogout={logout}
                onLoginRequested={() => navigate('/login', {state: {backgroundLocation: location}})}
                onSignupRequested={() => navigate('/signup', {state: {backgroundLocation: location}})}
            >
                <PageTransition transitionKey={transitionKey}>
                    <Routes location={routesLocation as Location}>
                        <Route
                            path="/"
                            element={
                                isAuthenticated ? <Navigate to="/dashboard" replace/> :
                                    <LandingPage
                                        onLoginRequested={() => navigate('/login', {state: {backgroundLocation: location}})}
                                        onSignupRequested={() => navigate('/signup', {state: {backgroundLocation: location}})}
                                    />
                            }
                        />

                        {/* Standard full-page routes */}
                        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace/> :
                            <Login onLoginSuccess={handleLoginSuccess}/>}/>
                        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace/> :
                            <Signup onSignupSuccess={handleSignupSuccess}/>}/>

                        <Route
                            path="/dashboard"
                            element={
                                <RequireAuth isAuthenticated={isAuthenticated} redirectTo={location}
                                             isLoggingOut={isLoggingOut}>
                                    <Dashboard onLogout={logout}/>
                                </RequireAuth>
                            }
                        />

                        <Route path="*" element={<NotFound/>}/>
                        <Route path="/about" element={<About/>}/>
                    </Routes>
                </PageTransition>
            </AppLayout>

            {/* Modal routes rendered when backgroundLocation is present */}
            {backgroundLocation && !isAuthenticated && (
                <Routes>
                    <Route path="/login" element={
                        <Modal isOpen title={undefined} size="sm" onRequestClose={() => navigate(-1)}>
                            <Login onLoginSuccess={handleLoginSuccess}
                                   onSignupRequested={() => {
                                       navigate('/signup', {state: {backgroundLocation: location}})

                                   }}/>
                        </Modal>
                    }/>
                    <Route path="/signup" element={
                        <Modal isOpen title={undefined} size="lg" onRequestClose={() => navigate(-1)}>
                            <Signup onSignupSuccess={handleSignupSuccess} onRequestClose={() => navigate(-1)}/>
                        </Modal>
                    }/>
                </Routes>
            )}
        </>
    );
}

export default App;

