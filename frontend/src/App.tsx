import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { api, ACCESS_TOKEN_KEY, clearAuthTokens } from './api/client';
import ServerWakingUp from './components/ServerWakingUp';

function App() {
  // Track whether the user is authenticated (based on stored token).
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Track whether the backend server is reachable.
  const [isServerReady, setIsServerReady] = useState(false);

  // On startup, check if a token already exists.
  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    setIsAuthenticated(!!token);
  }, []);

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

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearAuthTokens();
    setIsAuthenticated(false);
  };

  if (!isServerReady) {
    return <ServerWakingUp />;
  }

  return (
    <>
      {isAuthenticated ? (
        <Dashboard onLogout={logout} />
      ) : (
        <Login onLoginSuccess={login} />
      )}
    </>
  );
}

export default App;