import { useEffect, useMemo, useRef, useState } from 'react';
import type { Location } from 'react-router-dom';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
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

function RequireAuth({
  isAuthenticated,
  redirectTo,
  children,
  isLoggingOut,
}: {
  isAuthenticated: boolean;
  redirectTo: Location;
  children: React.ReactNode;
  isLoggingOut: boolean;
}) {
  if (isLoggingOut) {
    // Avoid redirect flashes while we are explicitly logging out.
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: redirectTo }} />;
  }
  return <>{children}</>;
}

type LocationStateWithFrom = {
  from?: {
    pathname?: string;
  };
};

type LocationStateWithBackground = {
  backgroundLocation?: Location;
};

function hasFrom(state: unknown): state is LocationStateWithFrom {
  return typeof state === 'object' && state !== null && 'from' in state;
}

function hasBackground(state: unknown): state is LocationStateWithBackground {
  return typeof state === 'object' && state !== null && 'backgroundLocation' in state;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  // Track whether the user is authenticated (based on stored token).
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return !!token;
  });

  // Track whether the backend server is reachable.
  const [isServerReady, setIsServerReady] = useState(false);

  // On startup, wait for the backend (+ database) to be ready.
  useEffect(() => {
    let cancelled = false;

    const pingReady = async () => {
      try {
        await api.get('/ready');
        if (!cancelled) setIsServerReady(true);
      } catch {
        if (cancelled) return;
        window.setTimeout(pingReady, 1500);
      }
    };

    pingReady();

    return () => {
      cancelled = true;
    };
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSignedOutToast, setShowSignedOutToast] = useState(false);

  const logout = () => {
    setIsLoggingOut(true);
    clearAuthTokens();
    setIsAuthenticated(false);
    setShowSignedOutToast(true);
    navigate('/', { replace: true, state: {} });
  };

  // Clear logout flag once we are back on the landing page.
  useEffect(() => {
    if (location.pathname !== '/') return;

    // Defer to avoid setState directly in effect body (eslint: react-hooks/set-state-in-effect)
    const id = window.setTimeout(() => setIsLoggingOut(false), 0);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  const redirectTo = useMemo(() => {
    // Store the attempt so we can come back after login.
    const maybeFrom = hasFrom(location.state) ? location.state.from?.pathname : undefined;
    return typeof maybeFrom === 'string' ? maybeFrom : '/dashboard';
  }, [location.state]);

  // Freeze the redirect target for the current login attempt to avoid flickers
  // while routes change (e.g., during logout or route transitions).
  const redirectToRef = useRef<string>(redirectTo);
  useEffect(() => {
    redirectToRef.current = redirectTo;
  }, [redirectTo]);

  const backgroundLocation = useMemo(() => {
    const maybeBg = hasBackground(location.state)
      ? location.state.backgroundLocation
      : undefined;
    return maybeBg && typeof maybeBg === 'object' ? maybeBg : undefined;
  }, [location.state]);

  if (!isServerReady) {
    return <ServerWakingUp />;
  }

  const routesLocation = backgroundLocation ?? location;

  const transitionKey = backgroundLocation ? backgroundLocation.key : location.key;

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate(redirectToRef.current, { replace: true });
  };

  return (
    <>
      {showSignedOutToast && (
        <ToastHost>
          <Toast
            message={t('common.signedOut')}
            onDone={() => setShowSignedOutToast(false)}
          />
        </ToastHost>
      )}

      <PageTransition transitionKey={transitionKey}>
        <Routes location={routesLocation}>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LandingPage
                  onLoginRequested={() =>
                    navigate('/login', { state: { backgroundLocation: location } })
                  }
                />
              )
            }
          />

          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              <RequireAuth
                isAuthenticated={isAuthenticated}
                redirectTo={location}
                isLoggingOut={isLoggingOut}
              >
                <Dashboard onLogout={logout} />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>

      {backgroundLocation && !isAuthenticated && (
        <Routes>
          <Route
            path="/login"
            element={
              <Modal
                isOpen
                title={undefined}
                onRequestClose={() => navigate(-1)}
              >
                <Login
                  onLoginSuccess={handleLoginSuccess}
                  onRequestClose={() => navigate(-1)}
                />
              </Modal>
            }
          />
        </Routes>
      )}
    </>
  );
}

export default App;
