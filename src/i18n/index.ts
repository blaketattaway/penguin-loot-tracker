import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import es from "./locales/es.json";

export const SUPPORTED_LANGUAGES = ["en", "es"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  // Detects the language from localStorage first, then the browser, and
  // remembers the user's choice for next time.
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: "en",
    // Map region variants (es-ES, es-MX, en-US…) down to the base language.
    load: "languageOnly",
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "plt-lang",
      caches: ["localStorage"],
    },
    interpolation: {
      // React already escapes values against XSS.
      escapeValue: false,
    },
  });

export default i18n;
