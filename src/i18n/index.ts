import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources, type Lang } from "./translations";

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "fr",
    fallbackLng: "fr",
    supportedLngs: ["fr", "ar", "en"],
    interpolation: { escapeValue: false },
    returnObjects: true,
  });
}

// On the server, the i18next instance is a module singleton shared across
// requests. Force it back to "fr" for every SSR render so the HTML always
// matches the initial client render (which also starts on "fr" before the
// stored language is applied in a client effect).
if (typeof window === "undefined" && i18n.language !== "fr") {
  i18n.changeLanguage("fr");
}

export const isRTL = (lang: string) => lang === "ar";

export function applyDirection(lang: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
}

export function loadStoredLanguage() {
  if (typeof window === "undefined") return;
  const stored = window.localStorage.getItem("coloragy-lang");
  if (stored && ["fr", "ar", "en"].includes(stored) && stored !== i18n.language) {
    i18n.changeLanguage(stored);
  }
}

export default i18n;
export type { Lang };
