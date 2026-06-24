/**
 * LanguageContext.tsx — Internationalization (i18n) System
 *
 * Supports English (en) and Tamil (தமிழ்/ta) out of the box.
 *
 * HOW IT WORKS:
 * - Translation JSON files live in src/locales/ (en.json, ta.json)
 * - The `t(key)` function looks up a key in the current language's file
 * - If a key is missing in the active language, it falls back to English
 * - If the key doesn't exist in English either, it returns the raw key string
 *   (so you can at least see WHICH key is missing in development)
 *
 * PERSISTENCE:
 * - The chosen language is saved to localStorage under "language"
 * - On page load, we read it back. If it's a removed language (hi/es/fr
 *   from an earlier version), we gracefully fall back to "en".
 *
 * USAGE IN COMPONENTS:
 *   const { t, language, setLanguage } = useLanguage();
 *   <h1>{t("welcome")}</h1>  // renders the translated "welcome" string
 */

import React, { createContext, useContext, useState } from "react";
import en from "../locales/en.json";
import ta from "../locales/ta.json";

// The two supported languages — add more here and in the translations object below
export type Language = "en" | "ta";

interface LanguageContextType {
  language: Language;             // currently active language code
  setLanguage: (lang: Language) => void; // switch language + persist to storage
  t: (key: string) => string;    // translate a key to the current language
}

// Bundle both locale files together under their language codes
const translations: Record<Language, Record<string, string>> = {
  en,
  ta
};

// The context object — undefined by default so we can detect misuse
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
// Wrap the whole app with this so any component can call useLanguage()
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");

    // Graceful migration: earlier versions supported hi/es/fr — if someone
    // had one of those saved, quietly reset them to English rather than breaking
    if (saved === "hi" || saved === "es" || saved === "fr") return "en";

    // Cast to Language if it's a valid value, otherwise default to English
    return (saved as Language) || "en";
  });

  // Switch language and persist the choice so it survives a page refresh
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  /**
   * t(key) — Translation lookup function
   *
   * 1. Try the current language first
   * 2. Fall back to English if the key doesn't exist in the active language
   * 3. Return the raw key as a last resort so devs can spot missing keys
   */
  const t = (key: string): string => {
    const langTrans = translations[language];
    if (langTrans && langTrans[key]) {
      return langTrans[key];
    }

    // Key is missing in the active language — fall back to English
    const enTrans = translations["en"];
    if (enTrans && enTrans[key]) {
      return enTrans[key];
    }

    // Key doesn't exist anywhere — return the key itself as a dev signal
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Throws if called outside of a LanguageProvider, which helps catch setup bugs early
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider — check your component tree");
  }
  return context;
};
