import { create } from 'zustand';
import type { Lang } from '../i18n';

// This store just holds the language; components use useT() hook
export const useLangStore = create<{ lang: Lang; setLang: (l: Lang) => void }>((set) => ({
  lang: (localStorage.getItem('lang') as Lang) ?? 'en',
  setLang: (lang) => {
    localStorage.setItem('lang', lang);
    set({ lang });
  },
}));
