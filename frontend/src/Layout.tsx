import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Accessibility,
  ArrowRight,
  ChevronDown,
  Globe2,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useApp } from "./context";
import { send, setCsrf } from "./api";

function ServiceMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`service-mark ${compact ? "compact" : ""}`}
      role="img"
      aria-label="Kutumb Setu service symbol"
    >
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path className="mark-roof" d="M8 27 32 9l24 18" />
        <circle className="mark-person" cx="32" cy="26" r="6" />
        <circle className="mark-person small" cx="18" cy="34" r="4.5" />
        <circle className="mark-person small" cx="46" cy="34" r="4.5" />
        <path className="mark-bridge" d="M11 51c6-9 13-13 21-13s15 4 21 13" />
        <path className="mark-base" d="M8 54h48" />
      </svg>
    </span>
  );
}

export default function Layout() {
  const { t, locale, setLocale, user, setUser, testMode } = useApp();
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [fontScale, setFontScale] = useState<"small" | "normal" | "large">(
    "normal",
  );
  const [highContrast, setHighContrast] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
    // Preserve the initial keyboard entry point (the skip link). Move focus
    // only after client-side navigation, including browser back/forward.
    if (previousPath.current !== location.pathname) {
      document.getElementById("main")?.focus();
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);
  useEffect(() => {
    const savedScale = window.localStorage.getItem("kutumb-font-scale");
    const savedContrast = window.localStorage.getItem("kutumb-contrast");
    if (["small", "normal", "large"].includes(savedScale || "")) {
      setFontScale(savedScale as "small" | "normal" | "large");
    }
    setHighContrast(savedContrast === "high");
  }, []);
  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale;
    document.documentElement.classList.toggle("high-contrast", highContrast);
    window.localStorage.setItem("kutumb-font-scale", fontScale);
    window.localStorage.setItem(
      "kutumb-contrast",
      highContrast ? "high" : "normal",
    );
  }, [fontScale, highContrast]);
  const signout = async () => {
    try {
      await send("/auth/logout", {});
      setCsrf("");
      setUser(null);
      navigate("/sign-in");
    } catch {
      navigate("/my");
    }
  };
  return (
    <>
      <a className="skip-link" href="#main">
        {t("Skip to main content", "મુખ્ય વિષય પર જાઓ")}
      </a>
      {testMode && (
        <aside
          className="demo-banner"
          aria-label={t("Test environment", "પરીક્ષણ વાતાવરણ")}
        >
          <div className="container">
            <ShieldCheck size={14} />
            <span>
              {t(
                "Test environment · Synthetic records · No live government transactions",
                "પરીક્ષણ વાતાવરણ · કૃત્રિમ નોંધો · વાસ્તવિક સરકારી વ્યવહાર નથી",
              )}
            </span>
            <Link to="/about">
              {t("About this environment", "આ વાતાવરણ વિશે")}{" "}
              <ArrowRight size={12} />
            </Link>
          </div>
        </aside>
      )}{" "}
      <nav
        className="utility"
        aria-label={t("Government and accessibility", "સરકાર અને સુલભતા")}
      >
        <div className="container">
          <span className="government-name">
            {t("Government of Gujarat", "ગુજરાત સરકાર")}
          </span>
          <div>
            <div
              className="access-tools"
              role="group"
              aria-label={t("Text size controls", "અક્ષર કદ નિયંત્રણ")}
            >
              <button
                type="button"
                aria-label={t("Decrease text size", "અક્ષર કદ ઘટાડો")}
                title={t("Decrease text size", "અક્ષર કદ ઘટાડો")}
                onClick={() => setFontScale("small")}
              >
                A−
              </button>
              <button
                type="button"
                aria-label={t("Default text size", "મૂળ અક્ષર કદ")}
                title={t("Default text size", "મૂળ અક્ષર કદ")}
                onClick={() => setFontScale("normal")}
              >
                A
              </button>
              <button
                type="button"
                aria-label={t("Increase text size", "અક્ષર કદ વધારો")}
                title={t("Increase text size", "અક્ષર કદ વધારો")}
                onClick={() => setFontScale("large")}
              >
                A+
              </button>
            </div>
            <button
              type="button"
              className="contrast-control"
              aria-pressed={highContrast}
              title={t("Toggle high contrast", "ઉચ્ચ કોન્ટ્રાસ્ટ બદલો")}
              onClick={() => setHighContrast((value) => !value)}
            >
              <span aria-hidden="true">◐</span>
              <span>{t("Contrast", "કોન્ટ્રાસ્ટ")}</span>
            </button>
            <button
              className="language"
              onClick={() => setLocale(locale === "gu" ? "en" : "gu")}
            >
              <Globe2 size={15} />
              <span lang={locale === "gu" ? "en" : "gu"}>
                {locale === "gu" ? "English" : "ગુજરાતી"}
              </span>
              <ChevronDown size={12} />
            </button>
            <Link to="/accessibility">
              <Accessibility size={15} />
              {t("Accessibility", "સુલભતા")}
            </Link>
            <Link to="/help">
              <HelpCircle size={15} />
              {t("Help", "મદદ")}
            </Link>
          </div>
        </div>
      </nav>
      <header>
        <div className="container masthead">
          <Link
            className="brand"
            to="/"
            aria-label={t(
              "Gujarat Kutumb Setu home",
              "ગુજરાત કુટુંબ સેતુ મુખ્ય પૃષ્ઠ",
            )}
          >
            <ServiceMark />
            <span className="brand-copy">
              <span className="brand-kicker">
                {t("Citizen services portal", "નાગરિક સેવા પોર્ટલ")}
              </span>
              <strong>{t("Gujarat Kutumb Setu", "ગુજરાત કુટુંબ સેતુ")}</strong>
              <small>
                {t(
                  "Family identity and government services",
                  "પરિવાર ઓળખ અને સરકારી સેવાઓ",
                )}
              </small>
            </span>
          </Link>
          <div className="masthead-right">
            <span className="masthead-note">
              {t("Family Identity Service", "પરિવાર ઓળખ સેવા")}
              <br />
              <b>{t("Government of Gujarat", "ગુજરાત સરકાર")}</b>
            </span>
            {user ? (
              <Link to="/my" className="button outline">
                {t("My dashboard", "મારું ડેશબોર્ડ")}
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/sign-in" className="button">
                {t("Sign in", "પ્રવેશ કરો")}
                <ArrowRight size={16} />
              </Link>
            )}
            <button
              aria-label={t("Open menu", "મેનુ ખોલો")}
              className="mobile-menu icon-button"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
              <span>{t("Menu", "મેનુ")}</span>
            </button>
          </div>
        </div>
      </header>
      <nav
        className={`main-nav ${menu ? "expanded" : ""}`}
        aria-label={t("Main navigation", "મુખ્ય નેવિગેશન")}
        onKeyDown={(e) => {
          if (e.key === "Escape") setMenu(false);
        }}
      >
        <div className="container">
          <div className="nav-links">
            {[
              ["/", t("Home", "મુખ્ય પૃષ્ઠ")],
              ["/services", t("Family services", "પરિવાર સેવાઓ")],
              ["/schemes", t("Schemes", "યોજનાઓ")],
              ["/help", t("Help & support", "મદદ અને સહાય")],
              ["/about", t("About Kutumb Setu", "કુટુંબ સેતુ વિશે")],
            ].map(([path, label]) => (
              <NavLink end={path === "/"} key={path} to={path}>
                {label}
              </NavLink>
            ))}
          </div>
          <form
            className="nav-search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/search?q=" + encodeURIComponent(query));
            }}
          >
            <label className="sr-only" htmlFor="public-search">
              {t("Search public information", "જાહેર માહિતી શોધો")}
            </label>
            <input
              id="public-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(
                "Search services & information",
                "સેવાઓ અને માહિતી શોધો",
              )}
            />
            <button aria-label={t("Search", "શોધો")}>
              <Search size={19} />
            </button>
          </form>
        </div>
      </nav>
      {user && (
        <div className="session-bar">
          <div className="container">
            <span>
              <span className="online-dot" />
              {t("Signed in as", "તરીકે પ્રવેશ")}{" "}
              <strong>{user.display_name}</strong>{" "}
              <span className="role-label">{user.role}</span>
            </span>
            <div>
              {["verifier", "approver", "admin", "operator"].includes(
                user.role,
              ) && (
                <Link to="/staff">
                  {t("Staff workspace", "કર્મચારી કાર્યસ્થળ")}
                </Link>
              )}
              {user.role === "department" && (
                <Link to="/departments">
                  {t("Department console", "વિભાગ કન્સોલ")}
                </Link>
              )}
              <button onClick={() => void signout()}>
                <LogOut size={14} />
                {t("Sign out", "બહાર નીકળો")}
              </button>
            </div>
          </div>
        </div>
      )}
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <section className="help-strip" aria-labelledby="help-strip-heading">
        <div className="container">
          <div className="help-strip-icon">
            <HelpCircle size={27} />
          </div>
          <div>
            <h2 id="help-strip-heading">
              {t("Help and assistance", "મદદ અને સહાય")}
            </h2>
            <p>
              {t(
                "Read application guidance or find an assisted-service centre.",
                "અરજીનું માર્ગદર્શન વાંચો અથવા સહાયિત સેવા કેન્દ્ર શોધો.",
              )}
            </p>
          </div>
          <Link className="button outline" to="/help">
            {t("Visit the help centre", "મદદ કેન્દ્ર જુઓ")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <footer>
        <div className="container footer-grid">
          <div>
            <Link to="/" className="footer-brand">
              <ServiceMark compact />
              <span>
                <strong>{t("ગુજરાત કુટુંબ સેતુ", "ગુજરાત કુટુંબ સેતુ")}</strong>
                <small>
                  {t("Citizen services portal", "નાગરિક સેવા પોર્ટલ")}
                </small>
              </span>
            </Link>
            <p>
              {t(
                "Family identity registration, record updates and service information for Gujarat residents.",
                "ગુજરાતના રહેવાસીઓ માટે પરિવાર ઓળખ નોંધણી, નોંધ સુધારા અને સેવા માહિતી.",
              )}
            </p>
            {testMode && (
              <span className="footer-demo">
                {t(
                  "TEST ENVIRONMENT · SYNTHETIC RECORDS",
                  "પરીક્ષણ વાતાવરણ · કૃત્રિમ નોંધો",
                )}
              </span>
            )}
          </div>
          <div>
            <h3>{t("Family services", "પરિવાર સેવાઓ")}</h3>
            <Link to="/apply/start">{t("New application", "નવી અરજી")}</Link>
            <Link to="/track">{t("Track a request", "વિનંતીની સ્થિતિ")}</Link>
            <Link to="/my/changes/new">
              {t("Update information", "માહિતી સુધારો")}
            </Link>
            <Link to="/schemes">{t("Explore schemes", "યોજનાઓ શોધો")}</Link>
          </div>
          <div>
            <h3>{t("Information & support", "માહિતી અને સહાય")}</h3>
            <Link to="/about">{t("About the initiative", "પહેલ વિશે")}</Link>
            <Link to="/help/centres">
              {t("Assistance centres", "સહાય કેન્દ્રો")}
            </Link>
            <Link to="/grievances">
              {t("Grievances & feedback", "ફરિયાદો અને અભિપ્રાય")}
            </Link>
            <Link to="/accessibility">{t("Accessibility", "સુલભતા")}</Link>
            <Link to="/contact">{t("Contact us", "અમારો સંપર્ક")}</Link>
            <Link to="/documents">
              {t("Guides & documents", "માર્ગદર્શિકા અને દસ્તાવેજો")}
            </Link>
          </div>
          <div>
            <h3>{t("Useful links", "ઉપયોગી કડીઓ")}</h3>
            <a
              href="https://mariyojana.gujarat.gov.in/Default.aspx"
              target="_blank"
              rel="noreferrer"
            >
              {t(
                "Mari Yojana ↗ (opens in new tab)",
                "મારી યોજના ↗ (નવી ટૅબમાં ખુલશે)",
              )}
            </a>
            <a
              href="https://www.digitalgujarat.gov.in/"
              target="_blank"
              rel="noreferrer"
            >
              {t(
                "Digital Gujarat ↗ (opens in new tab)",
                "ડિજિટલ ગુજરાત ↗ (નવી ટૅબમાં ખુલશે)",
              )}
            </a>
            <a
              href="https://www.india.gov.in/"
              target="_blank"
              rel="noreferrer"
            >
              {t(
                "National Portal of India ↗ (opens in new tab)",
                "ભારતનું રાષ્ટ્રીય પોર્ટલ ↗ (નવી ટૅબમાં ખુલશે)",
              )}
            </a>
            <Link to="/departments">
              {t("Department & developer access", "વિભાગ અને ડેવલપર પ્રવેશ")}
            </Link>
            <Link to="/staff">{t("Staff access", "કર્મચારી પ્રવેશ")}</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()}{" "}
            {t(
              "Gujarat Kutumb Setu · Content owned by Government of Gujarat",
              "ગુજરાત કુટુંબ સેતુ · વિષયવસ્તુ ગુજરાત સરકારની માલિકીની છે",
            )}
          </span>
          <div>
            <Link to="/policies/privacy">{t("Privacy", "ગોપનીયતા")}</Link>
            <Link to="/policies/terms">
              {t("Terms & disclaimer", "શરતો અને અસ્વીકરણ")}
            </Link>
            <Link to="/sitemap">{t("Sitemap", "સાઇટમેપ")}</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
