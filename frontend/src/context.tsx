import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, setCsrf } from "./api";
export type Locale = "en" | "gu";
export interface User {
  id: string;
  display_name: string;
  role: string;
  email?: string;
  district?: string;
  person_id?: string | null;
}
type Context = {
  locale: Locale;
  t: (en: string, gu: string) => string;
  setLocale: (l: Locale) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  ready: boolean;
  testMode: boolean;
  refreshSession: () => Promise<void>;
};
const AppContext = createContext<Context>(null!);
export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    localStorage.getItem("kutumb-locale") === "en" ? "en" : "gu",
  );
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const setLocale = (value: Locale) => {
    setLocaleState(value);
    localStorage.setItem("kutumb-locale", value);
  };
  const refreshSession = async () => {
    try {
      const value = await api<{ user: User; csrf_token: string }>("/auth/me");
      setUser(value.user);
      setCsrf(value.csrf_token);
    } catch {
      setUser(null);
      setCsrf("");
    } finally {
      setReady(true);
    }
  };
  useEffect(() => {
    void refreshSession();
  }, []);
  useEffect(() => {
    const expired = () => {
      setUser(null);
      setCsrf("");
    };
    window.addEventListener("kutumb-session-expired", expired);
    return () => window.removeEventListener("kutumb-session-expired", expired);
  }, []);
  useEffect(() => {
    api<{ mode: string }>("/public/config")
      .then((config) =>
        setTestMode(config.mode === "synthetic_demo" || config.mode === "test"),
      )
      .catch(() => setTestMode(false));
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <AppContext.Provider
      value={{
        locale,
        t: (en, gu) => (locale === "gu" ? gu : en),
        setLocale,
        user,
        setUser,
        ready,
        testMode,
        refreshSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export const useApp = () => useContext(AppContext);
