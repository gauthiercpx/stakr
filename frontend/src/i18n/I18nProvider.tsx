import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getLocale as getStoredLocale,
  setLocale as setStoredLocale,
  t as translate,
  type Locale,
  type MessageKey,
} from './strings';

import {I18nContext} from './context';

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    setStoredLocale(next);
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'fr' ? 'en' : 'fr');
  }, [locale, setLocale]);

  const t = useCallback((key: MessageKey) => translate(key, locale), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Note: `useI18n` is exported from `src/i18n/useI18n.ts` to keep this file
// compatible with react-refresh/only-export-components.
