import { useAuthStore } from '../stores/authStore'
import { translations, TranslationKey } from '../utils/translations'

export const useTranslation = () => {
  const { language, setLanguage } = useAuthStore()

  // Returns translated string or falls back to key
  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = translations[language] || translations['en']
    return dict[key] || fallback || String(key)
  }

  return {
    t,
    language,
    setLanguage
  }
}

export default useTranslation
