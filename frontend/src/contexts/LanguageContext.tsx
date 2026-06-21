import React, { createContext, useContext, useState } from "react";
import en from "../locales/en.json";
import ta from "../locales/ta.json";

export type Language = "en" | "ta";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en,
  ta
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    // Graceful migration from removed languages
    if (saved === "hi" || saved === "es" || saved === "fr") return "en";
    return (saved as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    const langTrans = translations[language];
    if (langTrans && langTrans[key]) {
      return langTrans[key];
    }
    // Fallback to English if key missing in translation
    const enTrans = translations["en"];
    if (enTrans && enTrans[key]) {
      return enTrans[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
