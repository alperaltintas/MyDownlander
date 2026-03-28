import { useLangStore } from '../store/language';
import { translations } from '../i18n';

export function useT() {
  const lang = useLangStore((s) => s.lang);
  const dict = translations[lang];
  return dict;
}
