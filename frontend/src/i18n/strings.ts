export type Locale = 'fr' | 'en';

export type MessageKey =
  | 'app.serverWaking.title'
  | 'app.serverWaking.subtitle'
  | 'app.serverWaking.tip'
  | 'login.title'
  | 'login.subtitle'
  | 'login.email.placeholder'
  | 'login.password.placeholder'
  | 'login.email.invalid'
  | 'login.password.required'
  | 'login.submit'
  | 'login.submit.loading'
  | 'login.error.incorrectCredentials'
  | 'login.error.serverStarting'
  | 'login.error.serverError';

const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  fr: {
    'app.serverWaking.title': '🚀 Réveil du serveur en cours...',
    'app.serverWaking.subtitle':
      "L’API (et la base de données) démarrent. Ça prend généralement quelques secondes.",
    'app.serverWaking.tip':
      'Astuce : si ça tourne indéfiniment, la base de données est peut-être arrêtée.',

    'login.title': 'Stakr',
    'login.subtitle': 'Ravi de te revoir !',
    'login.email.placeholder': 'Email',
    'login.password.placeholder': 'Mot de passe',
    'login.email.invalid': 'Adresse email invalide.',
    'login.password.required': 'Mot de passe requis.',
    'login.submit': 'Se connecter',
    'login.submit.loading': 'Connexion…',
    'login.error.incorrectCredentials': 'Email ou mot de passe incorrect.',
    'login.error.serverStarting':
      'Le serveur démarre. Patiente quelques secondes puis réessaie.',
    'login.error.serverError':
      'Erreur serveur. Réessaie dans quelques secondes.',
  },
  en: {
    'app.serverWaking.title': '🚀 Waking up the server…',
    'app.serverWaking.subtitle':
      'The API (and database) are starting. This usually takes a few seconds.',
    'app.serverWaking.tip':
      'Tip: if this keeps spinning, your database container may be down.',

    'login.title': 'Stakr',
    'login.subtitle': 'Welcome back',
    'login.email.placeholder': 'Email',
    'login.password.placeholder': 'Password',
    'login.email.invalid': 'Invalid email address.',
    'login.password.required': 'Password is required.',
    'login.submit': 'Sign in',
    'login.submit.loading': 'Signing in…',
    'login.error.incorrectCredentials': 'Incorrect email or password.',
    'login.error.serverStarting':
      'Server is starting up. Please wait a few seconds and retry.',
    'login.error.serverError': 'Server error. Please retry in a moment.',
  },
};

export function getLocale(): Locale {
  const raw = (localStorage.getItem('locale') || 'fr').toLowerCase();
  return raw === 'en' ? 'en' : 'fr';
}

/**
 * Persist the locale (future: wire to a UI toggle).
 */
export function setLocale(locale: Locale) {
  localStorage.setItem('locale', locale);
}

export function toggleLocale(): Locale {
  const next: Locale = getLocale() === 'fr' ? 'en' : 'fr';
  setLocale(next);
  return next;
}

export function t(key: MessageKey, locale: Locale = getLocale()): string {
  return MESSAGES[locale]?.[key] ?? MESSAGES.fr[key] ?? key;
}
