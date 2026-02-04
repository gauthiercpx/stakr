import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  // On regarde si un token existe déjà dans le stockage du navigateur
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Au démarrage, on vérifie le token
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
  };

  // C'est ici que le switch se fait
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