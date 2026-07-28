"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "id";
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (english: string, indonesian: string) => string };
const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  useEffect(() => { const timer = window.setTimeout(() => { const saved = localStorage.getItem("smart-inventory-language"); if (saved === "id" || saved === "en") setLanguageState(saved); }, 0); return () => window.clearTimeout(timer); }, []);
  const setLanguage = (next: Language) => { localStorage.setItem("smart-inventory-language", next); setLanguageState(next); };
  return <LanguageContext.Provider value={{ language, setLanguage, t: (english, indonesian) => language === "en" ? english : indonesian }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { const context = useContext(LanguageContext); if (!context) throw new Error("useLanguage must be used within LanguageProvider"); return context; }
