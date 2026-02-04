import {useState, useCallback} from 'react';
import {api} from '../api/client';

// On définit ce que le parent (App.tsx) doit nous donner
interface LoginProps {
    onLoginSuccess: () => void;
}

const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function Login({onLoginSuccess}: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = useCallback(async (evt?: React.FormEvent) => {
        if (evt) evt.preventDefault();

        const normalizedEmail = email.trim().toLowerCase();

        // Validation simple avant d'envoyer
        if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
            setError('Adresse email invalide.');
            return;
        }
        if (!password) {
            setError("Mot de passe requis.");
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('username', normalizedEmail);
            formData.append('password', password);

            const response = await api.post('/auth/token', formData, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });

            localStorage.setItem('access_token', response.data.access_token);
            onLoginSuccess();

        } catch (err: any) {
            console.error("Erreur Login:", err); // Pour voir l'erreur dans la console F12

            // On essaie de récupérer le message précis du backend
            const message = err?.response?.data?.detail || 'Email ou mot de passe incorrect';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [email, password, onLoginSuccess]);

    // Condition pour activer le bouton : Champs remplis ET email valide
    const canSubmit = email.trim() !== '' && password !== '' && isValidEmail(email.trim());

    // Variable pour savoir si le bouton doit être grisé (loading OU pas prêt)
    const isDisabled = isLoading || !canSubmit;

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                padding: '1.25rem',
                position: 'relative',
                background: 'linear-gradient(to right, #ffffff 0%, #bff104 100%)',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(191,241,4,0.15) 100%)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    pointerEvents: 'none',
                }}
            />

            <div
                style={{
                    padding: '2.5rem',
                    backgroundColor: 'white',
                    borderRadius: '1.5rem',
                    width: '100%',
                    maxWidth: '22.5rem',
                    textAlign: 'center',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)',
                    position: 'relative',
                }}
            >
                <h1 style={{margin: '0 0 0.5rem 0', fontSize: '2.5rem', color: '#000'}}>
                    Stakr
                </h1>
                <p style={{margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#666', fontWeight: 600}}>
                    Ravi de te revoir ! 👋
                </p>

                {/* Zone d'erreur */}
                <div aria-live="polite" style={{ minHeight: '20px', marginBottom: '1rem' }}>
                    {error && (
                        <div style={{
                            color: '#d32f2f',
                            backgroundColor: '#ffebee',
                            padding: '10px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            border: '1px solid #ffcdd2',
                            animation: 'fadeIn 0.3s'
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <input
                        aria-label="Email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        style={{
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: error ? '2px solid #ffcdd2' : '2px solid #f0f0f0', // Bordure rouge si erreur
                            backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.2s',
                            fontFamily: 'inherit',
                        }}
                    />

                    <input
                        aria-label="Mot de passe"
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        style={{
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            border: error ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                            backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                            fontSize: '1rem',
                            outline: 'none',
                            fontFamily: 'inherit',
                        }}
                    />

                    <button
                        type="submit"
                        disabled={isDisabled}
                        aria-busy={isLoading}
                        style={{
                            marginTop: '0.75rem',
                            padding: '1rem',
                            backgroundColor: '#000000',
                            color: '#bff104',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            boxShadow: '0 6px 14px rgba(0,0,0,0.20)',
                            transition: 'all 0.2s',

                            // 👇 C'EST ICI LA CORRECTION 👇
                            // Si désactivé (loading ou vide), on baisse l'opacité et on change le curseur
                            opacity: isDisabled ? 0.5 : 1,
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isLoading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}