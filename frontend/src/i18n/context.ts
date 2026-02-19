import {createContext} from 'react';

import type {Locale, MessageKey} from './strings';

export interface I18nContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    toggleLocale: () => void;
    t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);
