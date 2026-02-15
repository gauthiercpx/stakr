import { useEffect, useMemo, useRef, useState } from 'react';
import type { Location } from 'react-router-dom';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/signup/Signup';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import { api, ACCESS_TOKEN_KEY, clearAuthTokens } from './api/client';
import ServerWakingUp from './components/ServerWakingUp';
import Modal from './components/Modal';
import PageTransition from './components/PageTransition';
import { useI18n } from './i18n/useI18n';
import Toast from './components/Toast';
import ToastHost from './components/ToastHost';
import About from './pages/About/About.tsx';
import AppLayout from './layouts/AppLayout'; // 👈 On importe le layout

// ... (Garde tes fonctions utilitaires RequireAuth, hasFrom, etc. ici) ...
// Je ne les réécris pas pour gagner de la place, mais garde-les !

function RequireAuth({ isAuthenticated, redirectTo, children, isLoggingOut }: any) {
    if (isLoggingOut) return <Navigate to="/" replace />;
    if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: redirectTo }} />;
    return <>{children}</>;
}

function hasFrom(state: any): boolean { return state && typeof state === 'object' && 'from' in state; }
function hasBackground(state: any): boolean { return state && typeof state === 'object' && 'backgroundLocation' in state; }

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useI18n();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem(ACCESS_TOKEN_KEY));
    const [isServerReady, setIsServerReady] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showSignedOutToast, setShowSignedOutToast] = useState(false);
    const [showAccountCreatedToast, setShowAccountCreatedToast] = useState(false);

    // ... (Garde tes useEffects pour le ping server, logout, etc.) ...

    // Ping Server
    useEffect(() => {
        let cancelled = false;
        const pingReady = async () => {
            try { await api.get('/ready'); if (!cancelled) setIsServerReady(true); }
            catch { if (!cancelled) window.setTimeout(pingReady, 1500); }
        };
        pingReady();
        return () => { cancelled = true; };
    }, []);

    const logout = () => {
        setIsLoggingOut(true);
        clearAuthTokens();
        setIsAuthenticated(false);
        setShowSignedOutToast(true);
        navigate('/', { replace: true, state: {} });
    };

    // Logout cleanup
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

    const backgroundLocation = useMemo(() => {
        const maybeBg = hasBackground(location.state) ? location.state.backgroundLocation : undefined;
        return maybeBg && typeof maybeBg === 'object' ? maybeBg : undefined;
    }, [location.state]);

    if (!isServerReady) return <ServerWakingUp />;

    const routesLocation = backgroundLocation ?? location; // Cast as Location if needed
    const transitionKey = backgroundLocation ? (backgroundLocation as Location).key : location.key;

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        navigate(redirectToRef.current, { replace: true });
    };

    const handleSignupSuccess = () => {
        setIsAuthenticated(true);
        setShowAccountCreatedToast(true);
        navigate('/dashboard', { replace: true });
    }

    return (
        <>
            {showAccountCreatedToast && (
                <ToastHost>
                    <Toast message={t('common.accountCreated')} onDone={() => setShowAccountCreatedToast(false)} />
                </ToastHost>
            )}
            {showSignedOutToast && (
                <ToastHost>
                    <Toast message={t('common.signedOut')} onDone={() => setShowSignedOutToast(false)} />
                </ToastHost>
            )}

            {/* 👇 LE LAYOUT ENGLOBE TOUT */}
            <AppLayout
                isAuthenticated={isAuthenticated}
                onLogout={logout}
                onLoginRequested={() => navigate('/login', { state: { backgroundLocation: location } })}
                onSignupRequested={() => navigate('/signup', { state: { backgroundLocation: location } })}
            >
                <PageTransition transitionKey={transitionKey}>
                    <Routes location={routesLocation as Location}>
                        <Route
                            path="/"
                            element={
                                isAuthenticated ? <Navigate to="/dashboard" replace /> :
                                <LandingPage
                                    // Plus besoin de props onLoginRequested ici si LandingPage ne les utilise plus directement pour la navbar
                                    // Mais si tu as des boutons "Commencer" DANS la page, garde-les :
                                    onLoginRequested={() => navigate('/login', { state: { backgroundLocation: location } })}
                                    onSignupRequested={() => navigate('/signup', { state: { backgroundLocation: location } })}
                                />
                            }
                        />

                        {/* Route standard (sans modale) */}
                        <Route path="/login" element={ isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} /> } />
                        <Route path="/signup" element={ isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup onSignupSuccess={handleSignupSuccess} /> } />

                        <Route
                            path="/dashboard"
                            element={
                                <RequireAuth isAuthenticated={isAuthenticated} redirectTo={location} isLoggingOut={isLoggingOut}>
                                    <Dashboard onLogout={logout} />
                                </RequireAuth>
                            }
                        />

                        <Route path="*" element={<NotFound />} />
                        <Route path="/about" element={<About />} />
                    </Routes>
                </PageTransition>
            </AppLayout>

            {/* Routes Modales (hors layout) */}
            {backgroundLocation && !isAuthenticated && (
                <Routes>
                    <Route path="/login" element={
                        <Modal isOpen title={undefined} size="sm" onRequestClose={() => navigate(-1)}>
                            <Login onLoginSuccess={handleLoginSuccess} onRequestClose={() => navigate(-1)} />
                        </Modal>
                    } />
                    <Route path="/signup" element={
                        <Modal isOpen title={undefined} size="lg" onRequestClose={() => navigate(-1)}>
                            <Signup onSignupSuccess={handleSignupSuccess} onRequestClose={() => navigate(-1)} />
                        </Modal>
                    } />
                </Routes>
            )}
        </>
    );
}

export default App;