import {useState, useCallback} from 'react';
import {api, ACCESS_TOKEN_KEY} from '../api/client';
import {useI18n} from '../i18n/useI18n';
import NeonButton from '../components/NeonButton';

interface LoginProps {
    onLoginSuccess: () => void;
    onSignupRequested?: () => void;
}

const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function Login({onLoginSuccess, onSignupRequested}: LoginProps) {
    const {t} = useI18n();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = useCallback(
        async (evt?: React.FormEvent) => {
            evt?.preventDefault();

            const normalizedEmail = email.trim().toLowerCase();

            if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
                setError(t('login.email.invalid'));
                return;
            }
            if (!password) {
                setError(t('login.password.required'));
                return;
            }

            setError('');
            setIsLoading(true);

            try {
                const formData = new URLSearchParams();
                formData.append('username', normalizedEmail);
                formData.append('password', password);

                const response = await api.post('/auth/token', formData, {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                });

                localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access_token);
                onLoginSuccess();
            } catch (err: unknown) {
                if (import.meta.env.DEV) {
                    console.error('Login error:', err);
                }

                const axiosErr = err as {
                    response?: { status?: number; data?: { detail?: string } };
                };
                const status = axiosErr?.response?.status;
                if (status === 503) {
                    setError(t('login.error.serverStarting'));
                    return;
                }
                if (typeof status === 'number' && status >= 500) {
                    setError(t('login.error.serverError'));
                    return;
                }

                const message =
                    axiosErr?.response?.data?.detail ||
                    t('login.error.incorrectCredentials');
                setError(message);
            } finally {
                setIsLoading(false);
            }
        },
        [email, password, onLoginSuccess, t],
    );

    const canSubmit = email.trim() !== '' && password !== '' && isValidEmail(email.trim());
    const isDisabled = isLoading || !canSubmit;

    return (
        <div style={{position: 'relative'}}>

            <div style={{minHeight: '5.6rem', textAlign: 'center', paddingTop: '2.5rem'}}>
                <h1
                    style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '2.5rem',
                        lineHeight: 1.05,
                        color: '#000',
                    }}
                >
                    {t('login.title')}
                    <span style={{color: '#bff104'}}>.</span>
                </h1>
                <p
                    style={{
                        margin: '0 0 1.5rem 0',
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        color: '#666',
                        fontWeight: 600,
                    }}
                >
                    {t('login.subtitle')}
                </p>
            </div>

            {/* Zone d'erreur */}
            <div aria-live="polite" style={{minHeight: '20px', marginBottom: '1rem'}}>
                {error && (
                    <div
                        style={{
                            color: '#d32f2f',
                            backgroundColor: '#ffebee',
                            padding: '10px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            border: '1px solid #ffcdd2',
                            animation: 'fadeIn 0.3s',
                        }}
                    >
                        {error}
                    </div>
                )}
            </div>

            <form
                onSubmit={handleLogin}
                style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}
            >
                <input
                    name="email"
                    aria-label="Email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('login.email.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    style={{
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: error ? '2px solid #ffcdd2' : '2px solid #f0f0f0',
                        backgroundColor: isLoading ? '#e9ecef' : '#f8f9fa',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontFamily: 'inherit',
                    }}
                />

                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    <div className={`stakr-passwordField ${isLoading ? 'is-disabled' : ''}`}>
                        <input
                            name="password"
                            aria-label="Password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder={t('login.password.placeholder')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            style={{
                                width: '100%',
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
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={showPassword ? t('common.hide') : t('common.show')}
                            aria-pressed={showPassword}
                            disabled={isLoading}
                            className="stakr-passwordToggle"
                        >
                            {showPassword ? t('common.hide') : t('common.show')}
                        </button>
                    </div>

                    {/* 👇 Lien discret pour le mot de passe oublié 👇 */}
                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <button
                            type="button"
                            onClick={() => console.log('Aller vers Reset Password')}
                            disabled={true}
                            aria-label={t('common.hide')}
                            title={t('common.comingSoon')}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: '0 0.2rem',
                                color: '#666',
                                fontSize: '0.9rem',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                textDecoration: 'underline',
                                textUnderlineOffset: '3px',
                                fontFamily: 'inherit'
                            }}
                        >
                            {t('login.forgotPassword')}
                        </button>
                    </div>
                </div>

                {/* Bouton de soumission principal */}
                <NeonButton
                    type="submit"
                    disabled={isDisabled}
                    variant="solid"
                    label={isLoading ? t('login.submit.loading') : t('login.submit')}
                    style={{
                        marginTop: '0.5rem',
                        padding: '1rem',
                        fontSize: '1.1rem',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                />

                {/* 👇 Bouton de redirection vers Inscription 👇 */}
                {onSignupRequested && (
                    <NeonButton
                        type="button"
                        variant="outline"
                        disableOutlineHover={true}
                        label={t('login.createAccount')}
                        onClick={onSignupRequested}
                        disabled={isLoading}
                        style={{
                            padding: '1rem',
                            fontSize: '1.1rem',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    />
                )}

            </form>
        </div>
    );
}