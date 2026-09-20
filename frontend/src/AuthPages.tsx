import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowRight, Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { api, send, setCsrf } from "./api";
import { useApp } from "./context";
import type { User } from "./context";
import { ErrorBox, Field, Loading, Notice, useResource } from "./ui";
export function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: string[];
}) {
  const { user, ready, t } = useApp();
  const location = useLocation();
  if (!ready) return <Loading />;
  if (!user)
    return (
      <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
    );
  if (roles && !roles.includes(user.role))
    return (
      <div className="container page">
        <Notice type="warning">
          <strong>
            {t(
              "This workspace needs a different permission.",
              "આ કાર્યસ્થળ માટે અલગ પરવાનગી જરૂરી છે.",
            )}
          </strong>
          <p>
            {t(
              "Your session cannot access this role. Sign in through staff access with an authorized account.",
              "તમારા સત્રને આ ભૂમિકાનો પ્રવેશ નથી. અધિકૃત ખાતાથી કર્મચારી પ્રવેશ કરો.",
            )}
          </p>
        </Notice>
        <Link to="/my" className="button">
          {t("Return to my dashboard", "મારા ડેશબોર્ડ પર પાછા જાઓ")}
        </Link>
      </div>
    );
  return <>{children}</>;
}
interface Challenge {
  challenge_id: string;
  masked_destination: string;
  expires_in: number;
  resend_after: number;
  delivery_mode: string;
}
export function SignIn() {
  const { t, setUser, locale, testMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"resident" | "staff">("resident");
  const [register, setRegister] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const accounts = useResource(
    () =>
      testMode
        ? api<{
            items: {
              email: string;
              display_name: string;
              role: string;
              mobile?: string;
            }[];
            password: string;
          }>("/auth/demo-accounts")
        : Promise.resolve({ items: [], password: "" }),
    [testMode],
  );
  const finish = (res: { user: User; csrf_token: string }) => {
    setCsrf(res.csrf_token);
    setUser(res.user);
    const intended = (location.state as { from?: string } | null)?.from;
    const safeIntended =
      res.user.role === "resident"
        ? intended
        : intended &&
            (intended.startsWith("/staff") ||
              intended.startsWith("/admin") ||
              intended.startsWith("/departments"))
          ? intended
          : undefined;
    navigate(
      safeIntended ||
        (["verifier", "approver", "admin", "operator"].includes(res.user.role)
          ? "/staff"
          : res.user.role === "department"
            ? "/departments"
            : "/my"),
      { replace: true },
    );
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "staff") {
        finish(await send("/auth/login", { email, password }));
      } else if (challenge) {
        finish(
          await send("/auth/verify", {
            challenge_id: challenge.challenge_id,
            code,
          }),
        );
      } else {
        setChallenge(
          await send<Challenge>("/auth/challenges", {
            identifier,
            purpose: register ? "register" : "sign_in",
            ...(register ? { display_name: name, language: locale } : {}),
          }),
        );
      }
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container auth-layout">
      <div className="auth-explainer">
        <span className="eyebrow">
          {t("RESIDENT ACCOUNT ACCESS", "રહેવાસી ખાતા પ્રવેશ")}
        </span>
        <h1>{t("Gujarat Kutumb Setu", "ગુજરાત કુટુંબ સેતુ")}</h1>
        <p>
          {t(
            "Sign in to manage family records, applications, corrections and permitted benefit information.",
            "પરિવાર નોંધ, અરજીઓ, સુધારા અને માન્ય લાભ માહિતી સંભાળવા પ્રવેશ કરો.",
          )}
        </p>
        <ul className="check-list">
          <li>
            <Check />
            {t(
              "Save and resume your applications",
              "તમારી અરજીઓ સાચવો અને આગળ ભરો",
            )}
          </li>
          <li>
            <Check />
            {t(
              "Track verification and corrections",
              "ચકાસણી અને સુધારાની સ્થિતિ જુઓ",
            )}
          </li>
          <li>
            <Check />
            {t(
              "View your permitted benefit history",
              "તમને અનુમતિ ધરાવતા લાભનો ઇતિહાસ જુઓ",
            )}
          </li>
        </ul>
        <p className="muted">
          <ShieldCheck size={18} />{" "}
          {t(
            "Signing in verifies account access. It is not Aadhaar e-KYC or scheme eligibility.",
            "પ્રવેશ ખાતાની પહોંચ ચકાસે છે. તે આધાર e-KYC અથવા યોજનાની પાત્રતા નથી.",
          )}
        </p>
      </div>
      <section className="auth-card">
        <div className="tab-nav">
          <button
            className={mode === "resident" ? "active" : ""}
            onClick={() => {
              setMode("resident");
              setError(null);
            }}
          >
            {t("Resident", "રહેવાસી")}
          </button>
          <button
            className={mode === "staff" ? "active" : ""}
            onClick={() => {
              setMode("staff");
              setError(null);
            }}
          >
            {t("Staff & department", "કર્મચારી અને વિભાગ")}
          </button>
        </div>
        <h2>
          {mode === "staff"
            ? t("Authorized staff access", "અધિકૃત કર્મચારી પ્રવેશ")
            : challenge
              ? t("Verify your access", "તમારો પ્રવેશ ચકાસો")
              : register
                ? t("Create an account", "ખાતું બનાવો")
                : t("Sign in to your account", "તમારા ખાતામાં પ્રવેશ કરો")}
        </h2>
        <p className="muted">
          {mode === "staff"
            ? t(
                "Use your assigned staff credentials.",
                "તમને સોંપાયેલ કર્મચારી ઓળખ વાપરો.",
              )
            : challenge
              ? t(
                  `Enter the one-time code sent to ${challenge.masked_destination}.`,
                  `એક વખતનો કોડ દાખલ કરો: ${challenge.masked_destination}.`,
                )
              : t(
                  "Enter your mobile number or Family ID to continue.",
                  "આગળ વધવા તમારો મોબાઇલ નંબર અથવા પરિવાર ઓળખ દાખલ કરો.",
                )}
        </p>
        <form onSubmit={(e) => void submit(e)}>
          {mode === "staff" ? (
            <>
              <Field
                label={t("Official account email", "અધિકૃત ખાતાનો ઇમેઇલ")}
                required
              >
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field label={t("Password", "પાસવર્ડ")} required>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
            </>
          ) : challenge ? (
            <>
              <Field
                label={t("One-time code", "એક વખતનો કોડ")}
                required
                help={t(
                  `Code expires in ${Math.floor(challenge.expires_in / 60)} minutes. You may paste the code.`,
                  `કોડ ${Math.floor(challenge.expires_in / 60)} મિનિટમાં સમાપ્ત થશે. કોડ પેસ્ટ કરી શકો છો.`,
                )}
              >
                <input
                  name="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  autoFocus
                />
              </Field>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setChallenge(null);
                  setCode("");
                }}
              >
                {t(
                  "Use another number or request a new code",
                  "બીજો નંબર વાપરો અથવા નવો કોડ માંગો",
                )}
              </button>
            </>
          ) : (
            <>
              {register && (
                <Field label={t("Your name", "તમારું નામ")} required>
                  <input
                    value={name}
                    autoComplete="name"
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>
              )}
              <Field
                label={t(
                  "Mobile number or Family ID",
                  "મોબાઇલ નંબર અથવા પરિવાર ઓળખ",
                )}
                required
                help={t(
                  "A shared mobile number does not authorize access to every adult’s information.",
                  "વહેંચાયેલ મોબાઇલ નંબર દરેક પુખ્ત વ્યક્તિની માહિતી માટે અધિકૃતતા નથી.",
                )}
              >
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  required
                  placeholder={t(
                    "Enter mobile number or ID",
                    "મોબાઇલ નંબર અથવા ઓળખ દાખલ કરો",
                  )}
                />
              </Field>
            </>
          )}
          {Boolean(error) && <ErrorBox error={error} />}
          <button className="button" disabled={busy}>
            {busy
              ? t("Please wait…", "કૃપા કરીને રાહ જુઓ…")
              : mode === "staff"
                ? t("Sign in securely", "સુરક્ષિત પ્રવેશ કરો")
                : challenge
                  ? t("Verify and continue", "ચકાસો અને આગળ વધો")
                  : t("Get verification code", "ચકાસણી કોડ મેળવો")}
            <ArrowRight size={17} />
          </button>
        </form>
        {mode === "resident" && !challenge && (
          <p className="auth-switch">
            {register
              ? t("Already have an account?", "પહેલેથી ખાતું છે?")
              : t("New to Kutumb Setu?", "કુટુંબ સેતુમાં નવા છો?")}{" "}
            <button
              className="text-button"
              onClick={() => {
                setRegister(!register);
                setError(null);
              }}
            >
              {register
                ? t("Sign in", "પ્રવેશ કરો")
                : t("Create an account", "ખાતું બનાવો")}
            </button>
          </p>
        )}
        <Link className="text-link" to="/help">
          {t(
            "Cannot access your account? Get help",
            "ખાતામાં પ્રવેશ નથી થતો? મદદ મેળવો",
          )}
        </Link>
        {testMode && (
          <details className="demo-tools">
            <summary>
              <LockKeyhole size={14} /> &nbsp;
              {t("Test environment tools", "પરીક્ષણ વાતાવરણ સાધનો")}
            </summary>
            <p>
              {t(
                "Synthetic records only. Resident verification code: 123456. This provider does not send an SMS.",
                "માત્ર કૃત્રિમ નોંધો. રહેવાસી ચકાસણી કોડ: 123456. આ પ્રદાતા SMS મોકલતો નથી.",
              )}
            </p>
            <div className="demo-personas">
              {accounts.data?.items.map((a, i) => (
                <button
                  type="button"
                  key={a.email}
                  onClick={() => {
                    if (a.role === "resident") {
                      setMode("resident");
                      setIdentifier(
                        a.mobile ||
                          ([
                            "resident@demo.local",
                            "new.resident@demo.local",
                            "other.resident@demo.local",
                          ].indexOf(a.email) >= 0
                            ? ["9000000001", "9000000002", "9000000003"][
                                [
                                  "resident@demo.local",
                                  "new.resident@demo.local",
                                  "other.resident@demo.local",
                                ].indexOf(a.email)
                              ]
                            : "900000000" + (i + 1)),
                      );
                      setChallenge(null);
                      setRegister(false);
                    } else {
                      setMode("staff");
                      setEmail(a.email);
                      setPassword(accounts.data!.password);
                    }
                    setError(null);
                  }}
                >
                  <strong>{a.display_name}</strong> · {a.role}
                </button>
              ))}
            </div>
            {accounts.error && (
              <p>
                {t(
                  "Test helpers unavailable. Use your assigned credentials.",
                  "પરીક્ષણ સહાયકો ઉપલબ્ધ નથી. ફાળવેલી ઓળખ વાપરો.",
                )}
              </p>
            )}
          </details>
        )}
      </section>
    </div>
  );
}
