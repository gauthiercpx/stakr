import { useEffect, useMemo, useState } from 'react';
import type { Location } from 'react-router-dom';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import { api, ACCESS_TOKEN_KEY, clearAuthTokens } from './api/client';
import ServerWakingUp from './components/ServerWakingUp';

function RequireAuth({
  isAuthenticated,
  redirectTo,
  children,
}: {
  isAuthenticated: boolean;
  redirectTo: Location;
  children: React.ReactNode;
}) {
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

function hasFrom(state: unknown): state is LocationStateWithFrom {
  return typeof state === 'object' && state !== null && 'from' in state;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

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

  const logout = () => {
    clearAuthTokens();
    setIsAuthenticated(false);
    // Hard redirect avoids any intermediate guard redirect to /login
    window.location.assign('/');
  };

  const redirectTo = useMemo(() => {
    // Store the attempt so we can come back after login.
    const maybeFrom = hasFrom(location.state) ? location.state.from?.pathname : undefined;
    return typeof maybeFrom === 'string' ? maybeFrom : '/dashboard';
  }, [location.state]);

  if (!isServerReady) {
    return <ServerWakingUp />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LandingPage onLoginRequested={() => navigate('/login')} />
          )
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              onLoginSuccess={() => {
                setIsAuthenticated(true);
                navigate(redirectTo, { replace: true });
              }}
            />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth isAuthenticated={isAuthenticated} redirectTo={location}>
            <Dashboard onLogout={logout} />
          </RequireAuth>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
