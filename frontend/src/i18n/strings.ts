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
    | 'nav.about'
    | 'nav.menu'
    | 'nav.mobileMenu'
    | 'nav.brandAria'
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
    | 'about.title'
    | 'about.description'
    | 'about.valuesTitle'
    | 'about.value1'
    | 'about.value2'
    | 'about.value3'
    | 'about.backHome'
    | 'dashboard.greeting'
    | 'dashboard.subtitle'
    | 'dashboard.account.title'
    | 'dashboard.account.status.active'
    | 'dashboard.account.status.inactive'
    | 'dashboard.assets.title'
    | 'dashboard.assets.trigger'
    | 'dashboard.assets.loading'
    | 'dashboard.assets.empty'
    | 'dashboard.stacks.title'
    | 'dashboard.stacks.count'
    | 'dashboard.stacks.create'
    | 'dashboard.portfolio.title'
    | 'dashboard.portfolio.empty'
    | 'dashboard.portfolio.loading'
    | 'dashboard.portfolio.error'
    | 'dashboard.portfolio.defaultName'
    | 'dashboard.portfolio.select'
    | 'dashboard.portfolio.open'
    | 'dashboard.portfolio.dividends'
    | 'dashboard.portfolio.kpi.totalValue'
    | 'dashboard.portfolio.kpi.totalInvested'
    | 'dashboard.portfolio.kpi.pnl'
    | 'dashboard.actions.addTransaction'
    | 'dashboard.actions.addAsset'
    | 'dashboard.actions.addPortfolio'
    | 'dashboard.actions.modalPlaceholder'
    | 'dashboard.charts.title'
    | 'dashboard.charts.placeholder'
    | 'dashboard.charts.noData'
    | 'dashboard.charts.tooltipLabel'
    | 'portfolioPage.titleFallback'
    | 'portfolioPage.backToDashboard'
    | 'portfolioPage.empty'
    | 'portfolioPage.table.asset'
    | 'portfolioPage.table.ticker'
    | 'portfolioPage.table.quantity'
    | 'portfolioPage.table.avgPrice'
    | 'portfolioPage.table.currentPrice'
    | 'portfolioPage.table.value'
    | 'portfolioPage.table.dividends'
    | 'common.signedOut'
    | 'common.accountCreated'
    | 'common.cancel'
    | 'common.show'
    | 'common.hide'
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
    | 'login.error.serverError'
    | 'login.forgotPassword'
    | 'login.noAccount'
    | 'login.createAccount'
    | 'signup.title'
    | 'signup.subtitle'
    | 'signup.email.placeholder'
    | 'signup.emailConfirm.placeholder'
    | 'signup.password.placeholder'
    | 'signup.passwordConfirm.placeholder'
    | 'signup.email.invalid'
    | 'signup.email.mismatch'
    | 'signup.firstName.label'
    | 'signup.firstName.placeholder'
    | 'signup.firstName.required'
    | 'signup.firstName.invalidFormat'
    | 'signup.lastName.label'
    | 'signup.lastName.placeholder'
    | 'signup.lastName.required'
    | 'signup.jobTitle.label'
    | 'signup.jobTitle.placeholder'
    | 'signup.password.required'
    | 'signup.password.tooShort'
    | 'signup.password.mismatch'
    | 'signup.submit'
    | 'signup.submit.loading'
    | 'signup.error.emailAlreadyUsed'
    | 'signup.error.serverStarting'
    | 'signup.error.serverError'
    | 'signup.error.generic';

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
        'nav.about': 'À propos',
        'nav.menu': 'Menu',
        'nav.mobileMenu': 'Menu mobile',
        'nav.brandAria': 'Aller à l\'accueil',

        'landing.hero.title.line1': 'Visualise tes investissements en temps réel',
        'landing.hero.title.brand': 'STAKR',
        'landing.hero.title.after': '✨',
        'landing.hero.subtitle':
            'Centralise tes investissements, visualise leur évolution et pilote ta performance avec un dashboard clair et rapide.',
        'landing.cta.signup': 'Créer un compte',
        'landing.cta.login': 'Se connecter',
        'landing.cta.dashboardReady': 'Ton dashboard prêt en quelques clics',
        'landing.preview.title': 'Aperçu du dashboard',
        'landing.preview.desc':
            'Connecte-toi pour suivre tes portfolios, tes actifs et ta performance.',
        'landing.preview.cta': 'Accéder au dashboard',
        'landing.features.focus.title': 'Clair et épuré',
        'landing.features.focus.desc':
            'Une interface simple pour te concentrer sur l’essentiel, sans bruit inutile.',
        'landing.features.fast.title': 'Rapide au quotidien',
        'landing.features.fast.desc':
            'Tout est accessible en quelques clics pour suivre tes actifs sans friction.',
        'landing.features.ready.title': 'Prêt pour la suite',
        'landing.features.ready.desc':
            'Une base solide qui évolue avec tes besoins, à ton rythme.',

        'about.title': 'À propos de Stakr',
        'about.description': "Stakr centralise tes actifs et portfolios boursiers pour t'aider à suivre ta performance d'un coup d'œil.",
        'about.valuesTitle': 'Nos valeurs',
        'about.value1': 'Simplicité',
        'about.value2': 'Vitesse',
        'about.value3': 'Concentration',
        'about.backHome': 'Retour à l\'accueil',

        'dashboard.greeting': 'Bonjour',
        'dashboard.subtitle': 'Prêt à piloter tes portfolios ?',
        'dashboard.account.title': 'Mon compte',
        'dashboard.account.status.active': '● Actif',
        'dashboard.account.status.inactive': '● Inactif',
        'dashboard.assets.title': 'Aperçu des actifs',
        'dashboard.assets.trigger': 'Actifs du portfolio',
        'dashboard.assets.loading': 'Chargement des actifs...',
        'dashboard.assets.empty': 'Aucun actif dans ce portfolio pour le moment.',
        'dashboard.stacks.title': 'Mes portfolios',
        'dashboard.stacks.count': '0',
        'dashboard.stacks.create': '+ Créer un portfolio',
        'dashboard.portfolio.title': 'Mon portfolio',
        'dashboard.portfolio.empty': 'Crée ton premier portfolio pour afficher ta performance.',
        'dashboard.portfolio.loading': 'Chargement du portfolio...',
        'dashboard.portfolio.error': 'Impossible de charger le portfolio pour le moment.',
        'dashboard.portfolio.defaultName': 'Portfolio principal',
        'dashboard.portfolio.select': 'Portfolio',
        'dashboard.portfolio.open': 'Ouvrir le portfolio complet',
        'dashboard.portfolio.dividends': 'Dividendes perçus',
        'dashboard.portfolio.kpi.totalValue': 'Valeur totale',
        'dashboard.portfolio.kpi.totalInvested': 'Montant investi',
        'dashboard.portfolio.kpi.pnl': 'PnL global',
        'dashboard.actions.addTransaction': '+ Ajouter une transaction',
        'dashboard.actions.addAsset': '+ Ajouter un actif',
        'dashboard.actions.addPortfolio': '+ Créer un portfolio',
        'dashboard.actions.modalPlaceholder': 'Cette fonctionnalité arrive bientôt. Cette modale est un placeholder.',
        'dashboard.charts.title': 'Graphiques',
        'dashboard.charts.placeholder': 'Zone réservée aux graphiques (allocation, évolution, performance).',
        'dashboard.charts.noData': 'Aucune donnée disponible pour cette période.',
        'dashboard.charts.tooltipLabel': 'Valeur du portfolio',
        'portfolioPage.titleFallback': 'Portfolio',
        'portfolioPage.backToDashboard': 'Retour au dashboard',
        'portfolioPage.empty': 'Aucune position dans ce portfolio.',
        'portfolioPage.table.asset': 'Actif',
        'portfolioPage.table.ticker': 'Ticker',
        'portfolioPage.table.quantity': 'Quantité',
        'portfolioPage.table.avgPrice': 'Prix moyen',
        'portfolioPage.table.currentPrice': 'Prix actuel',
        'portfolioPage.table.value': 'Valeur',
        'portfolioPage.table.dividends': 'Dividendes',
        'common.signedOut': 'Tu as bien été déconnecté.',
        'common.accountCreated': 'Compte créé avec succès. Bienvenue !',
        'common.cancel': 'Annuler',
        'common.show': 'Afficher',
        'common.hide': 'Masquer',
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
        'login.forgotPassword': 'Mot de passe oublié ?',
        'login.noAccount': "Pas encore de compte ?",
        'login.createAccount': "Créer un compte",
        'signup.title': 'Stakr',
        'signup.subtitle': 'Créer ton compte',
        'signup.email.placeholder': 'Email',
        'signup.emailConfirm.placeholder': 'Confirme ton email',
        'signup.password.placeholder': 'Mot de passe',
        'signup.passwordConfirm.placeholder': 'Confirme le mot de passe',
        'signup.email.invalid': 'Adresse email invalide.',
        'signup.email.mismatch': "Les adresses e-mail ne correspondent pas.",
        'signup.firstName.label': 'Prénom',
        'signup.firstName.placeholder': 'Prénom',
        'signup.firstName.required': 'Prénom requis.',
        'signup.firstName.invalidFormat': 'Le prénom contient des caractères non valides.',
        'signup.lastName.label': 'Nom',
        'signup.lastName.placeholder': 'Nom',
        'signup.lastName.required': 'Nom requis.',
        'signup.jobTitle.label': 'Poste',
        'signup.jobTitle.placeholder': 'Poste (optionnel)',
        'signup.password.required': 'Mot de passe requis.',
        'signup.password.tooShort': 'Le mot de passe doit contenir au moins 8 caractères.',
        'signup.password.mismatch': 'Les mots de passe ne correspondent pas.',
        'signup.submit': 'Créer un compte',
        'signup.submit.loading': 'Création…',
        'signup.error.emailAlreadyUsed': 'Cet email est déjà utilisé.',
        'signup.error.serverStarting':
            'Le serveur démarre. Patiente quelques secondes puis réessaie.',
        'signup.error.serverError': 'Erreur serveur. Réessaie dans quelques secondes.',
        'signup.error.generic': 'Impossible de créer le compte. Réessaie.',
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
        'nav.about': 'About',
        'nav.menu': 'Menu',
        'nav.mobileMenu': 'Mobile menu',
        'nav.brandAria': 'Go to home',

        'landing.hero.title.line1': 'Visualize your investments in real time',
        'landing.hero.title.brand': 'STAKR',
        'landing.hero.title.after': '✨',
        'landing.hero.subtitle':
            'Centralize your investments, monitor their evolution, and stay in control with a clean, fast dashboard.',
        'landing.cta.signup': 'Create account',
        'landing.cta.login': 'Sign in',
        'landing.cta.dashboardReady': 'Dashboard ready in a few clicks',
        'landing.preview.title': 'Dashboard preview',
        'landing.preview.desc':
            'Sign in to track your portfolios, assets, and performance.',
        'landing.preview.cta': 'Open dashboard',
        'landing.features.focus.title': 'Clear and focused',
        'landing.features.focus.desc':
            'A minimal space to stay focused on what matters and avoid noise.',
        'landing.features.fast.title': 'Fast to use',
        'landing.features.fast.desc':
            'Everything is available in a few clicks to monitor your assets without friction.',
        'landing.features.ready.title': 'Ready for what’s next',
        'landing.features.ready.desc':
            'Designed to grow with you and adapt to your pace.',

        'about.title': 'About Stakr',
        'about.description': 'Stakr centralizes your assets and stock portfolios to help you track performance at a glance.',
        'about.valuesTitle': 'Our values',
        'about.value1': 'Simplicity',
        'about.value2': 'Speed',
        'about.value3': 'Focus',
        'about.backHome': 'Back to home',

        'dashboard.greeting': 'Hello',
        'dashboard.subtitle': 'Ready to track your portfolios?',
        'dashboard.account.title': 'My account',
        'dashboard.account.status.active': '● Active',
        'dashboard.account.status.inactive': '● Inactive',
        'dashboard.assets.title': 'Asset overview',
        'dashboard.assets.trigger': 'Portfolio assets',
        'dashboard.assets.loading': 'Loading assets...',
        'dashboard.assets.empty': 'No assets in this portfolio yet.',
        'dashboard.stacks.title': 'My portfolios',
        'dashboard.stacks.count': '0',
        'dashboard.stacks.create': '+ Create a portfolio',
        'dashboard.portfolio.title': 'My portfolio',
        'dashboard.portfolio.empty': 'Create your first portfolio to start tracking performance.',
        'dashboard.portfolio.loading': 'Loading portfolio...',
        'dashboard.portfolio.error': 'Could not load portfolio right now.',
        'dashboard.portfolio.defaultName': 'Main portfolio',
        'dashboard.portfolio.select': 'Portfolio',
        'dashboard.portfolio.open': 'Open full portfolio',
        'dashboard.portfolio.dividends': 'Dividends received',
        'dashboard.portfolio.kpi.totalValue': 'Total value',
        'dashboard.portfolio.kpi.totalInvested': 'Total invested',
        'dashboard.portfolio.kpi.pnl': 'Global PnL',
        'dashboard.actions.addTransaction': '+ Add transaction',
        'dashboard.actions.addAsset': '+ Add asset',
        'dashboard.actions.addPortfolio': '+ Create portfolio',
        'dashboard.actions.modalPlaceholder': 'This feature is coming soon. This modal is a placeholder.',
        'dashboard.charts.title': 'Charts',
        'dashboard.charts.placeholder': 'Chart area (allocation, performance, timeline) coming next.',
        'dashboard.charts.noData': 'No data available for this period.',
        'dashboard.charts.tooltipLabel': 'Portfolio value',
        'portfolioPage.titleFallback': 'Portfolio',
        'portfolioPage.backToDashboard': 'Back to dashboard',
        'portfolioPage.empty': 'No positions in this portfolio.',
        'portfolioPage.table.asset': 'Asset',
        'portfolioPage.table.ticker': 'Ticker',
        'portfolioPage.table.quantity': 'Quantity',
        'portfolioPage.table.avgPrice': 'Average price',
        'portfolioPage.table.currentPrice': 'Current price',
        'portfolioPage.table.value': 'Value',
        'portfolioPage.table.dividends': 'Dividends',
        'common.signedOut': 'You have been signed out.',
        'common.accountCreated': 'Account created successfully. Welcome!',
        'common.cancel': 'Cancel',
        'common.show': 'Show',
        'common.hide': 'Hide',
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
        'login.forgotPassword': 'Forgot password?',
        'login.noAccount': "Don't have an account?",
        'login.createAccount': "Create account",
        'signup.title': 'Stakr',
        'signup.subtitle': 'Create your account',
        'signup.email.placeholder': 'Email',
        'signup.emailConfirm.placeholder': 'Confirm email',
        'signup.password.placeholder': 'Password',
        'signup.passwordConfirm.placeholder': 'Confirm password',
        'signup.email.invalid': 'Invalid email address.',
        'signup.email.mismatch': 'Email addresses do not match.',
        'signup.firstName.label': 'First name',
        'signup.firstName.placeholder': 'First name',
        'signup.firstName.required': 'First name is required.',
        'signup.firstName.invalidFormat': 'First name contains invalid characters.',
        'signup.lastName.label': 'Last name',
        'signup.lastName.placeholder': 'Last name',
        'signup.lastName.required': 'Last name is required.',
        'signup.jobTitle.label': 'Job title',
        'signup.jobTitle.placeholder': 'Job title (optional)',
        'signup.password.required': 'Password is required.',
        'signup.password.tooShort': 'Password must be at least 8 characters.',
        'signup.password.mismatch': 'Passwords do not match.',
        'signup.submit': 'Create account',
        'signup.submit.loading': 'Creating…',
        'signup.error.emailAlreadyUsed': 'This email is already in use.',
        'signup.error.serverStarting':
            'Server is starting up. Please wait a few seconds and retry.',
        'signup.error.serverError': 'Server error. Please retry in a moment.',
        'signup.error.generic': 'Could not create account. Please try again.',
    },
};

export function getLocale(): Locale {
    const raw = (localStorage.getItem('locale') || 'fr').toLowerCase();
    return raw === 'en' ? 'en' : 'fr';
}

export function setLocale(locale: Locale) {
    localStorage.setItem('locale', locale);
}

export function t(key: MessageKey, locale: Locale = getLocale()): string {
    return MESSAGES[locale]?.[key] ?? MESSAGES.fr[key] ?? key;
}
