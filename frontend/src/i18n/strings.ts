export type Locale = 'fr' | 'en';

export type MessageKey =
  | 'app.serverWaking.title'
  | 'app.serverWaking.subtitle'
  | 'app.serverWaking.tip'
  | 'notFound.title'
  | 'notFound.subtitle'
  | 'notFound.goHome'
  | 'notFound.goBack'
  | 'nav.signup'
  | 'nav.login'
  | 'nav.logout'
  | 'landing.hero.title.line1'
  | 'landing.hero.title.brand'
  | 'landing.hero.title.after'
  | 'landing.hero.subtitle'
  | 'landing.cta.signup'
  | 'landing.cta.login'
  | 'landing.cta.dashboardReady'
  | 'landing.preview.title'
  | 'landing.preview.desc'
  | 'landing.preview.cta'
  | 'landing.features.focus.title'
  | 'landing.features.focus.desc'
  | 'landing.features.fast.title'
  | 'landing.features.fast.desc'
  | 'landing.features.ready.title'
  | 'landing.features.ready.desc'
  | 'dashboard.greeting'
  | 'dashboard.subtitle'
  | 'dashboard.account.title'
  | 'dashboard.account.status.active'
  | 'dashboard.account.status.inactive'
  | 'dashboard.stacks.title'
  | 'dashboard.stacks.count'
  | 'dashboard.stacks.create'
  | 'common.signedOut'
  | 'common.cancel'
  | 'common.loading'
  | 'common.comingSoon'
  | 'common.languageToggle'
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

    'notFound.title': 'Page introuvable',
    'notFound.subtitle': "Le lien que tu as suivi n’existe pas (ou plus).",
    'notFound.goHome': "Retour à l’accueil",
    'notFound.goBack': 'Page précédente',

    'nav.signup': 'Créer un compte',
    'nav.login': 'Se connecter',
    'nav.logout': 'Déconnexion',

    'landing.hero.title.line1': 'Organise tes stacks en un seul endroit',
    'landing.hero.title.brand': 'STAKR',
    'landing.hero.title.after': '✨',
    'landing.hero.subtitle':
      'Centralise, visualise et garde le rythme avec un dashboard clair, rapide, et pensé pour le focus.',
    'landing.cta.signup': 'Créer un compte',
    'landing.cta.login': 'Se connecter',
    'landing.cta.dashboardReady': 'Dashboard prêt en quelques clics',
    'landing.preview.title': 'Aperçu Dashboard',
    'landing.preview.desc':
      'Connecte-toi pour voir tes stacks, tes infos et les prochaines étapes.',
    'landing.preview.cta': 'Accéder au dashboard',
    'landing.features.focus.title': 'Clair et focus',
    'landing.features.focus.desc':
      'Un espace épuré pour rester concentré sur l’essentiel et éviter le bruit.',
    'landing.features.fast.title': 'Rapide à utiliser',
    'landing.features.fast.desc':
      'Tout est à portée de main pour visualiser tes stacks et avancer sans friction.',
    'landing.features.ready.title': 'Prêt pour la suite',
    'landing.features.ready.desc': 'Pensé pour grandir avec toi et s’adapter à ton rythme.',

    'dashboard.greeting': 'Hello',
    'dashboard.subtitle': 'Prêt à gérer tes Stacks ? ',
    'dashboard.account.title': 'Mon Compte',
    'dashboard.account.status.active': '● Actif',
    'dashboard.account.status.inactive': '● Inactif',
    'dashboard.stacks.title': 'Mes Stacks',
    'dashboard.stacks.count': '0',
    'dashboard.stacks.create': '+ Créer une Stack',
    'common.signedOut': 'Tu as bien été déconnecté.',
    'common.cancel': 'Annuler',
    'common.loading': 'Chargement... ⏳',
    'common.comingSoon': 'Bientôt disponible',
    'common.languageToggle': 'Changer de langue',

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

    'notFound.title': 'Page not found',
    'notFound.subtitle': 'The page you are looking for does not exist.',
    'notFound.goHome': 'Go to home',
    'notFound.goBack': 'Go back',

    'nav.signup': 'Create account',
    'nav.login': 'Sign in',
    'nav.logout': 'Sign out',

    'landing.hero.title.line1': 'Organize your stacks in one place',
    'landing.hero.title.brand': 'STAKR',
    'landing.hero.title.after': '✨',
    'landing.hero.subtitle':
      'Centralize, visualize, and keep the momentum with a clean, fast dashboard built for focus.',
    'landing.cta.signup': 'Create account',
    'landing.cta.login': 'Sign in',
    'landing.cta.dashboardReady': 'Dashboard ready in a few clicks',
    'landing.preview.title': 'Dashboard preview',
    'landing.preview.desc':
      'Sign in to see your stacks, your info, and the next steps.',
    'landing.preview.cta': 'Open dashboard',
    'landing.features.focus.title': 'Clear and focused',
    'landing.features.focus.desc':
      'A minimal space to stay focused on what matters and avoid noise.',
    'landing.features.fast.title': 'Fast to use',
    'landing.features.fast.desc':
      'Everything is at your fingertips to track stacks and move forward without friction.',
    'landing.features.ready.title': 'Ready for what’s next',
    'landing.features.ready.desc':
      'Designed to grow with you and adapt to your pace.',

    'dashboard.greeting': 'Hello',
    'dashboard.subtitle': 'Ready to manage your stacks?',
    'dashboard.account.title': 'My account',
    'dashboard.account.status.active': '● Active',
    'dashboard.account.status.inactive': '● Inactive',
    'dashboard.stacks.title': 'My stacks',
    'dashboard.stacks.count': '0',
    'dashboard.stacks.create': '+ Create a stack',
    'common.signedOut': 'You have been signed out.',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading... ⏳',
    'common.comingSoon': 'Coming soon',
    'common.languageToggle': 'Switch language',

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

export function t(key: MessageKey, locale: Locale = getLocale()): string {
  return MESSAGES[locale]?.[key] ?? MESSAGES.fr[key] ?? key;
}
