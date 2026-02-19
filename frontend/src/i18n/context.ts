import {createContext} from 'react';
import type {Locale, MessageKey} from './strings';

export interface I18nContextValue {
  locale: Locale;
  setLocale(next: Locale): void;
  toggleLocale(): void;
  // Accept MessageKey or arbitrary string keys for flexibility
  t(key: MessageKey | string): string;
}

export const I18nContext = createContext<I18nContextValue | undefined>(undefined);
