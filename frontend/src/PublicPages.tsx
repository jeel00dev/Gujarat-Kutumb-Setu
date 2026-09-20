import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FilePenLine,
  Fingerprint,
  GraduationCap,
  HandHeart,
  Leaf,
  MapPin,
  Search,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { api, send } from "./api";
import type { List, Scheme } from "./api";
import { useApp } from "./context";
import {
  Breadcrumb,
  Empty,
  ErrorBox,
  Field,
  Loading,
  Notice,
  PageHeading,
  Pagination,
  Status,
  formatDate,
  useResource,
} from "./ui";
const taskData = [
  [
    "/find-id",
    "Find my Family ID",
    "મારી પરિવાર ઓળખ શોધો",
    "Check your existing family record.",
    "તમારી હાલની પરિવાર નોંધ તપાસો.",
    Fingerprint,
  ],
  [
    "/apply/start",
    "Apply for Family ID",
    "પરિવાર ઓળખ માટે અરજી કરો",
    "Start a new family registration.",
    "નવા પરિવારની નોંધણી શરૂ કરો.",
    FilePenLine,
  ],
  [
    "/track",
    "Track or resume",
    "સ્થિતિ જુઓ અથવા આગળ ભરો",
    "Follow a request or finish a draft.",
    "વિનંતી જુઓ અથવા ડ્રાફ્ટ પૂર્ણ કરો.",
    ClipboardList,
  ],
  [
    "/my/changes/new",
    "Update family details",
    "પરિવારની માહિતી સુધારો",
    "Request a correction or life event.",
    "સુધારા અથવા જીવન પ્રસંગની વિનંતી કરો.",
    UsersRound,
  ],
  [
    "/schemes",
    "Find government schemes",
    "સરકારી યોજનાઓ શોધો",
    "Explore services that may help.",
    "ઉપયોગી સેવાઓ વિશે જાણો.",
    HandHeart,
  ],
  [
    "/help/centres",
    "Get assistance",
    "સહાય મેળવો",
    "Guidance for your next step.",
    "તમારા આગળના પગલા માટે માર્ગદર્શન.",
    MapPin,
  ],
] as const;
export function Home() {
  const { t } = useApp();
  return (
    <>
      <div className="home-hero">
        <div className="container hero-grid">
          <div className="hero-intro">
            <span className="eyebrow">
              {t("Gujarat family identity service", "ગુજરાત પરિવાર ઓળખ સેવા")}
            </span>
            <h1>
              {t(
                "Apply for and manage Gujarat Family ID",
                "ગુજરાત પરિવાર ઓળખ માટે અરજી અને સંચાલન",
              )}
            </h1>
            <p>
              {t(
                "Apply for a Family ID, check an existing record, track requests and access information about connected government schemes.",
                "પરિવાર ઓળખ માટે અરજી કરો, હાલની નોંધ તપાસો, વિનંતીની સ્થિતિ જુઓ અને જોડાયેલી સરકારી યોજનાઓની માહિતી મેળવો.",
              )}
            </p>
            <div className="hero-actions">
              <Link to="/apply/start" className="button">
                {t("Start a new application", "નવી અરજી શરૂ કરો")}
                <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="text-link">
                {t("How Kutumb Setu works", "કુટુંબ સેતુ કેવી રીતે કામ કરે છે")}
                <ChevronRight size={17} />
              </Link>
            </div>
            <div className="hero-assurance">
              <ShieldCheck size={17} />
              {t(
                "Your information, with purpose-based access.",
                "તમારી માહિતી, હેતુ આધારિત પ્રવેશ સાથે.",
              )}
            </div>
          </div>
          <div className="hero-aside">
            <div className="hero-service-panel">
              <div className="hero-service-heading">
                <span>{t("Citizen services", "નાગરિક સેવાઓ")}</span>
                <small>{t("Quick access", "ઝડપી પ્રવેશ")}</small>
              </div>
              <Link to="/find-id">
                <span>
                  {t("Find an existing Family ID", "હાલની પરિવાર ઓળખ શોધો")}
                </span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/track">
                <span>{t("Track an application", "અરજીની સ્થિતિ જુઓ")}</span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/my/changes/new">
                <span>
                  {t("Request a family update", "પરિવાર સુધારાની વિનંતી")}
                </span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/help/centres">
                <span>{t("Get assisted service", "સહાયિત સેવા મેળવો")}</span>
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container announcement">
        <span className="notice-label">
          {t("PLEASE NOTE", "કૃપા કરીને નોંધો")}
        </span>
        <p>
          {t(
            "A Family ID connects your family information. Each scheme has its own eligibility and approval process.",
            "પરિવાર ઓળખ તમારી પરિવારની માહિતી જોડે છે. દરેક યોજનાની પોતાની પાત્રતા અને મંજૂરી પ્રક્રિયા છે.",
          )}
        </p>
        <Link
          to="/about"
          aria-label={t("Read about Kutumb Setu", "કુટુંબ સેતુ વિશે વાંચો")}
        >
          <ArrowRight size={19} />
        </Link>
      </div>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t("Family services", "પરિવાર સેવાઓ")}
            </span>
            <h2>{t("What would you like to do?", "તમે શું કરવા માંગો છો?")}</h2>
          </div>
          <Link to="/services" className="text-link">
            {t("View all services", "બધી સેવાઓ જુઓ")}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="task-grid">
          {taskData.map(([to, en, gu, desc, descGu, Icon], i) => (
            <Link
              to={to}
              key={to}
              className={`task-card ${i === 1 ? "featured" : ""}`}
            >
              <span className="task-icon">
                <Icon size={25} strokeWidth={1.6} />
              </span>
              <span className="task-copy">
                <h3>{t(en, gu)}</h3>
                <p>{t(desc, descGu)}</p>
              </span>
              <ArrowRight className="task-arrow" size={18} />
            </Link>
          ))}
        </div>
      </section>
      <section className="container registration-routes">
        <div>
          <WalletCards size={30} strokeWidth={1.5} />
          <div>
            <h3>{t("Have a ration card?", "તમારી પાસે રેશન કાર્ડ છે?")}</h3>
            <p>
              {t(
                "Check for an existing record before you apply. Your family may already be linked.",
                "અરજી કરતા પહેલાં હાલની નોંધ તપાસો. તમારો પરિવાર પહેલેથી જોડાયેલ હોઈ શકે છે.",
              )}
            </p>
            <Link to="/find-id" className="text-link">
              {t("Check existing record", "હાલની નોંધ તપાસો")}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <div>
          <FilePenLine size={30} strokeWidth={1.5} />
          <div>
            <h3>
              {t(
                "No ration card? You can still start.",
                "રેશન કાર્ડ નથી? શરૂઆત કરી શકો છો.",
              )}
            </h3>
            <p>
              {t(
                "Use the independent registration route, or get help if you are unsure.",
                "સ્વતંત્ર નોંધણીનો વિકલ્પ પસંદ કરો અથવા ખાતરી ન હોય તો મદદ મેળવો.",
              )}
            </p>
            <Link to="/apply/start" className="text-link">
              {t("See how to apply", "અરજી કરવાની રીત જુઓ")}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
      <section className="process-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {t("Registration process", "સરળ પગલાં. સ્પષ્ટ પ્રગતિ.")}
              </span>
              <h2>
                {t(
                  "From registration to a family record",
                  "નોંધણીથી પરિવારની નોંધ સુધી",
                )}
              </h2>
            </div>
          </div>
          <div className="process-grid">
            {[
              [
                t("Check", "તપાસો"),
                t(
                  "Find out whether your family already has a record.",
                  "તમારા પરિવારની નોંધ પહેલેથી છે કે નહીં તે તપાસો.",
                ),
              ],
              [
                t("Provide details", "વિગતો આપો"),
                t(
                  "Add family members and residence information.",
                  "પરિવારના સભ્યો અને રહેઠાણની વિગતો ઉમેરો.",
                ),
              ],
              [
                t("Review & submit", "ચકાસો અને મોકલો"),
                t(
                  "Check your declaration and receive a reference.",
                  "તમારી જાહેરાત ચકાસો અને અરજી નંબર મેળવો.",
                ),
              ],
              [
                t("Follow the outcome", "પરિણામ જુઓ"),
                t(
                  "Track verification and any action you need to take.",
                  "ચકાસણી અને જરૂરી પગલાંની સ્થિતિ જુઓ.",
                ),
              ],
            ].map(([title, desc], i) => (
              <div key={title}>
                <span className="step-number">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t("Schemes and services", "યોજનાઓ અને સેવાઓ")}
            </span>
            <h2>
              {t(
                "Find support for every stage of life",
                "જીવનના દરેક તબક્કે સહાય શોધો",
              )}
            </h2>
            <p>
              {t(
                "Browse information without signing in. Each department decides eligibility.",
                "પ્રવેશ કર્યા વિના માહિતી જુઓ. પાત્રતા સંબંધિત વિભાગ નક્કી કરે છે.",
              )}
            </p>
          </div>
          <Link to="/schemes" className="text-link">
            {t("Explore schemes", "યોજનાઓ શોધો")}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="category-grid">
          {[
            ["Education", "Education", "શિક્ષણ", GraduationCap],
            [
              "Women and child development",
              "Women & children",
              "મહિલા અને બાળકો",
              UsersRound,
            ],
            ["Social security", "Social support", "સામાજિક સહાય", HandHeart],
            ["Agriculture", "Farming & livelihood", "ખેતી અને આજીવિકા", Leaf],
          ].map(([id, en, gu, Icon]) => {
            const Component = Icon as typeof Leaf;
            return (
              <Link key={String(id)} to={"/schemes?category=" + id}>
                <Component size={27} strokeWidth={1.5} />
                <h3>{t(String(en), String(gu))}</h3>
                <ArrowRight size={17} />
              </Link>
            );
          })}
        </div>
      </section>
      <section className="official-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {t("Public information", "જાહેર માહિતી")}
              </span>
              <h2>{t("Official information", "અધિકૃત માહિતી")}</h2>
              <p>
                {t(
                  "Current service policies and guidance published on this portal.",
                  "આ પોર્ટલ પર પ્રકાશિત હાલની સેવા નીતિઓ અને માર્ગદર્શન.",
                )}
              </p>
            </div>
          </div>
          <div className="official-list">
            {[
              [
                "/policies/privacy",
                t("Privacy and data use", "ગોપનીયતા અને માહિતીનો ઉપયોગ"),
                t("Policy", "નીતિ"),
              ],
              [
                "/policies/terms",
                t("Terms and service disclaimer", "શરતો અને સેવા અસ્વીકરણ"),
                t("Policy", "નીતિ"),
              ],
              [
                "/accessibility",
                t("Accessibility statement", "સુલભતા નિવેદન"),
                t("Statement", "નિવેદન"),
              ],
              [
                "/documents",
                t("Guides and documents", "માર્ગદર્શિકા અને દસ્તાવેજો"),
                t("Guidance", "માર્ગદર્શન"),
              ],
            ].map(([to, title, type]) => (
              <Link to={to} key={to}>
                <span>
                  <strong>{title}</strong>
                  <small>
                    {t("Kutumb Setu service portal", "કુટુંબ સેતુ સેવા પોર્ટલ")}
                    {" · "}
                    {type}
                    {" · HTML"}
                  </small>
                </span>
                <span className="official-action">
                  {t("View", "જુઓ")}
                  <ChevronRight size={17} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="container bottom-info">
        <div>
          <span className="eyebrow">{t("Service scope", "સેવાનો વ્યાપ")}</span>
          <h2>
            {t(
              "Your family information, explained.",
              "તમારી પરિવારની માહિતી, સરળ રીતે.",
            )}
          </h2>
          <p>
            {t(
              "Registration, scheme applications and reported benefits are different things. Kutumb Setu makes the next step clear.",
              "નોંધણી, યોજનાની અરજી અને નોંધાયેલ લાભ અલગ બાબતો છે. કુટુંબ સેતુ આગળનું પગલું સ્પષ્ટ કરે છે.",
            )}
          </p>
          <Link to="/help" className="text-link">
            {t("Read common questions", "સામાન્ય પ્રશ્નો વાંચો")}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="faq-preview">
          {[
            [
              t(
                "Does a Family ID guarantee benefits?",
                "શું પરિવાર ઓળખ લાભની ખાતરી આપે છે?",
              ),
              t(
                "No. The owning department applies each scheme’s rules and makes the decision.",
                "ના. સંબંધિત વિભાગ યોજનાના નિયમો મુજબ નિર્ણય કરે છે.",
              ),
            ],
            [
              t(
                "Can I save an unfinished application?",
                "શું હું અધૂરી અરજી સાચવી શકું?",
              ),
              t(
                "Yes. Save a draft securely, then return after signing in. A saved draft is not a submitted application.",
                "હા. ડ્રાફ્ટ સુરક્ષિત રીતે સાચવો અને પ્રવેશ કર્યા પછી આગળ ભરો. સાચવેલો ડ્રાફ્ટ મોકલેલી અરજી નથી.",
              ),
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <ChevronRight size={17} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

export function Services() {
  const { t } = useApp();
  return (
    <div className="container page">
      <Breadcrumb label={t("Family services", "પરિવાર સેવાઓ")} />
      <PageHeading
        eyebrow={t("Citizen services", "નાગરિક સેવાઓ")}
        title={t("Family services", "પરિવાર સેવાઓ")}
        description={t(
          "Choose your task. Registration and changes are reviewed before they take effect.",
          "તમારું કાર્ય પસંદ કરો. નોંધણી અને સુધારા અમલમાં આવતા પહેલાં ચકાસવામાં આવે છે.",
        )}
      />
      <div className="task-grid">
        {taskData.map(([to, en, gu, desc, descGu, Icon]) => (
          <Link key={to} to={to} className="task-card">
            <span className="task-icon">
              <Icon />
            </span>
            <span>
              <h3>{t(en, gu)}</h3>
              <p>{t(desc, descGu)}</p>
            </span>
            <ArrowRight size={18} />
          </Link>
        ))}
      </div>
      <div className="info-panel">
        <h2>{t("Before you start", "શરૂઆત કરતા પહેલાં")}</h2>
        <ul className="check-list">
          <li>
            <Check />
            {t(
              "Review the purpose, required information and privacy notice.",
              "હેતુ, જરૂરી માહિતી અને ગોપનીયતા સૂચના ચકાસો.",
            )}
          </li>
          <li>
            <Check />
            {t(
              "No Aadhaar, bank, caste or property information is requested.",
              "આધાર, બેંક, જાતિ કે મિલકતની માહિતી માંગવામાં આવતી નથી.",
            )}
          </li>
          <li>
            <Check />
            {t(
              "Save your draft and review every detail before submitting.",
              "તમારો ડ્રાફ્ટ સાચવો અને મોકલતા પહેલાં દરેક વિગત ચકાસો.",
            )}
          </li>
        </ul>
        <p>
          {t(
            "Demo charge: none. Production service fees, timelines and responsible offices require approved publication.",
            "નિદર્શન માટે કોઈ શુલ્ક નથી. વાસ્તવિક સેવાના શુલ્ક, સમયમર્યાદા અને જવાબદાર કચેરીનું અધિકૃત પ્રકાશન જરૂરી છે.",
          )}
        </p>
      </div>
    </div>
  );
}

export function Schemes() {
  const { t } = useApp();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const category = params.get("category") || "";
  const page = Number(params.get("page") || 1);
  const result = useResource(
    () => api<List<Scheme>>("/schemes?" + params.toString()),
    [params.toString()],
  );
  return (
    <div className="container page">
      <Breadcrumb label={t("Schemes", "યોજનાઓ")} />
      <PageHeading
        eyebrow={t("Government services", "સરકારી સેવાઓ")}
        title={t(
          "Support that may be relevant to you",
          "તમારા માટે ઉપયોગી સહાય",
        )}
        description={t(
          "Explore scheme information. Your Family ID does not automatically establish eligibility.",
          "યોજનાની માહિતી જાણો. પરિવાર ઓળખ આપોઆપ પાત્રતા સ્થાપિત કરતી નથી.",
        )}
      />
      <form
        className="filter-bar"
        onSubmit={(e) => {
          e.preventDefault();
          setParams({ q: query, category });
        }}
      >
        <Field label={t("Search schemes", "યોજનાઓ શોધો")}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              "Name, need or department",
              "નામ, જરૂરિયાત અથવા વિભાગ",
            )}
          />
        </Field>
        <Field label={t("Category", "વિભાગ")}>
          <select
            value={category}
            onChange={(e) => setParams({ q: query, category: e.target.value })}
          >
            <option value="">{t("All categories", "બધા વિભાગો")}</option>
            <option value="Education">{t("Education", "શિક્ષણ")}</option>
            <option value="Women and child development">
              {t("Women & children", "મહિલા અને બાળકો")}
            </option>
            <option value="Social security">
              {t("Social support", "સામાજિક સહાય")}
            </option>
            <option value="Agriculture">{t("Agriculture", "ખેતી")}</option>
            <option value="Disability support">
              {t("Disability support", "દિવ્યાંગ સહાય")}
            </option>
            <option value="Family welfare">
              {t("Family welfare", "પરિવાર કલ્યાણ")}
            </option>
          </select>
        </Field>
        <button className="button">
          <Search size={17} />
          {t("Search", "શોધો")}
        </button>
        <button
          type="button"
          className="button outline"
          onClick={() => {
            setQuery("");
            setParams({});
          }}
        >
          {t("Reset", "રીસેટ")}
        </button>
      </form>
      {result.loading ? (
        <Loading />
      ) : result.error ? (
        <ErrorBox error={result.error} retry={result.reload} />
      ) : (
        <>
          <p className="result-count" role="status">
            {result.data?.total} {t("schemes found", "યોજનાઓ મળી")}
          </p>
          <div className="scheme-grid">
            {result.data?.items.map((s) => (
              <Link
                className="scheme-card"
                key={s.id}
                to={"/schemes/" + s.slug}
              >
                <div className="scheme-card-top">
                  <span className="scheme-icon">
                    <HandHeart size={24} />
                  </span>
                  <span className="tag">
                    {s.capability === "demo_connected"
                      ? t("CONNECTED SERVICE", "જોડાયેલ સેવા")
                      : t("Official information", "અધિકૃત માહિતી")}
                  </span>
                </div>
                <small>{s.department}</small>
                <h2>{t(s.name, s.name_gu || s.name)}</h2>
                <p>{t(s.summary, s.summary_gu || s.summary)}</p>
                <span className="text-link">
                  {t("View details", "વિગતો જુઓ")}
                  <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
          {!result.data?.items.length && (
            <Empty
              title={t(
                "No schemes match these filters",
                "આ ફિલ્ટર મુજબ કોઈ યોજના મળી નથી",
              )}
            >
              <button
                className="button outline"
                onClick={() => {
                  setQuery("");
                  setParams({});
                }}
              >
                {t("Show all schemes", "બધી યોજનાઓ બતાવો")}
              </button>
            </Empty>
          )}
          {result.data && (
            <Pagination
              page={page}
              total={result.data.total}
              pageSize={result.data.page_size}
              onChange={(value) =>
                setParams({ q: query, category, page: String(value) })
              }
            />
          )}
        </>
      )}
      <Notice>
        {t(
          "Scheme pages identify the owning department and available application channel. A referral is not a sanction or payment.",
          "યોજનાના પૃષ્ઠે જવાબદાર વિભાગ અને અરજીનો વિકલ્પ દર્શાવાય છે. રેફરલ મંજૂરી કે ચુકવણી નથી.",
        )}
      </Notice>
    </div>
  );
}

export function SchemeDetail() {
  const { slug } = useParams();
  const { t, user } = useApp();
  const result = useResource(() => api<Scheme>("/schemes/" + slug), [slug]);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [consent, setConsent] = useState(false);
  const [key] = useState(() => crypto.randomUUID());
  const refer = async () => {
    setBusy(true);
    setError(null);
    try {
      const value = await send<{ reference: string }>(
        "/scheme-applications",
        { scheme_id: result.data!.id, consent },
        "POST",
        key,
      );
      setReference(value.reference);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  if (result.loading) return <Loading />;
  if (result.error)
    return (
      <div className="container page">
        <ErrorBox error={result.error} />
      </div>
    );
  const s = result.data!;
  return (
    <div className="container page">
      <Breadcrumb label={t("Scheme details", "યોજનાની વિગતો")} />
      <PageHeading
        eyebrow={s.department}
        title={t(s.name, s.name_gu || s.name)}
        description={t(s.summary, s.summary_gu || s.summary)}
      />
      <div className="content-with-aside">
        <article className="panel prose">
          <h2>{t("About this service", "આ સેવા વિશે")}</h2>
          <p>{t(s.summary, s.summary_gu || s.summary)}</p>
          <h2>{t("Who can apply", "કોણ અરજી કરી શકે")}</h2>
          {Array.isArray(s.eligibility) ? (
            <ul className="plain-list">
              {s.eligibility.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>
              {s.eligibility ||
                t(
                  "Confirm current rules with the owning department.",
                  "વર્તમાન નિયમો સંબંધિત વિભાગ પાસેથી જાણો.",
                )}
            </p>
          )}
          <h2>{t("Evidence and documents", "પુરાવા અને દસ્તાવેજો")}</h2>
          {Array.isArray(s.documents) ? (
            <ul className="plain-list">
              {s.documents.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>
              {s.documents ||
                t(
                  "The department confirms the current evidence requirements.",
                  "વિભાગ વર્તમાન પુરાવાની જરૂરિયાતો નક્કી કરે છે.",
                )}
            </p>
          )}
          <h2>
            {t("The role of your Family ID", "તમારી પરિવાર ઓળખની ભૂમિકા")}
          </h2>
          <p>
            {t(
              "A family record can support approved information reuse. It is not a scheme award, proof of citizenship, caste certificate or payment confirmation.",
              "પરિવારની નોંધ મંજૂર માહિતીના પુનઃઉપયોગમાં સહાય કરે છે. તે યોજનાનો લાભ, નાગરિકતાનો પુરાવો, જાતિ પ્રમાણપત્ર કે ચુકવણીની પુષ્ટિ નથી.",
            )}
          </p>
          {s.source_url && (
            <a
              className="text-link"
              href={s.source_url}
              target="_blank"
              rel="noreferrer"
            >
              {t(
                "Read the source on the owner’s website ↗",
                "વિભાગની વેબસાઇટ પર સ્ત્રોત વાંચો ↗",
              )}
            </a>
          )}
        </article>
        <aside>
          <div className="panel">
            <h2>{t("How to proceed", "આગળ કેવી રીતે વધવું")}</h2>
            <Status value={s.capability} />
            <p>
              {t("Benefit type", "સહાયનો પ્રકાર")}: {s.benefit_type}
            </p>
            {s.capability === "demo_connected" ? (
              <>
                {reference ? (
                  <Notice type="success">
                    {t("Referral received", "રેફરલ પ્રાપ્ત")}:{" "}
                    <strong>{reference}</strong>
                    <p>
                      {t(
                        "This is a referral, not an award or payment.",
                        "આ રેફરલ છે, લાભ કે ચુકવણી નથી.",
                      )}
                    </p>
                  </Notice>
                ) : user ? (
                  <>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      {t(
                        "I authorize the minimum required information to be sent to this service for review.",
                        "હું ચકાસણી માટે આ સેવાને લઘુતમ જરૂરી માહિતી મોકલવા મંજૂરી આપું છું.",
                      )}
                    </label>
                    <button
                      className="button full"
                      disabled={!consent || busy}
                      onClick={() => void refer()}
                    >
                      {busy
                        ? t("Submitting…", "મોકલી રહ્યું છે…")
                        : t("Send application referral", "અરજી રેફરલ મોકલો")}
                    </button>
                  </>
                ) : (
                  <Link className="button" to="/sign-in">
                    {t("Sign in to continue", "આગળ વધવા પ્રવેશ કરો")}
                  </Link>
                )}
              </>
            ) : s.application_url ? (
              <a
                href={s.application_url}
                className="button"
                target="_blank"
                rel="noreferrer"
              >
                {t("Visit department website ↗", "વિભાગની વેબસાઇટ જુઓ ↗")}
              </a>
            ) : (
              <p>
                {t(
                  "Information only. No application is submitted by this page.",
                  "માત્ર માહિતી. આ પૃષ્ઠથી કોઈ અરજી મોકલાતી નથી.",
                )}
              </p>
            )}
            {Boolean(error) && <ErrorBox error={error} />}
            <hr />
            <small>
              {t("Last updated", "છેલ્લો સુધારો")}: {formatDate(s.updated_at)}
            </small>
          </div>
        </aside>
      </div>
    </div>
  );
}

const faq = [
  [
    "Does registration guarantee a benefit?",
    "શું નોંધણી લાભની ખાતરી આપે છે?",
    "No. Every scheme has its own rules and owning department. Recommendations are not approvals.",
    "ના. દરેક યોજનાના પોતાના નિયમો અને વિભાગ છે. ભલામણ મંજૂરી નથી.",
  ],
  [
    "Can I apply without a ration card?",
    "શું રેશન કાર્ડ વિના અરજી કરી શકું?",
    "Yes, an independent no-ration registration route is available. Your application will be reviewed before a new family record is issued.",
    "હા, રેશન કાર્ડ વિના સ્વતંત્ર નોંધણીનો વિકલ્પ છે. નવી પરિવાર નોંધ આપતા પહેલાં અરજી ચકાસવામાં આવશે.",
  ],
  [
    "What happens after I submit?",
    "અરજી મોકલ્યા પછી શું થાય?",
    "You receive a tracking reference. A verifier reviews the application, then a separate approver decides. A family record is created after approval.",
    "તમને અરજી નંબર મળે છે. ચકાસણી અધિકારી અરજી તપાસે છે, પછી અલગ મંજૂરી અધિકારી નિર્ણય કરે છે. મંજૂરી બાદ પરિવારની નોંધ બને છે.",
  ],
  [
    "What if my details need a correction?",
    "મારી વિગતોમાં સુધારો જરૂરી હોય તો?",
    "Open Update family details. Changes are requests, not direct edits to verified records. You can track review and implementation.",
    "પરિવારની માહિતી સુધારો ખોલો. સુધારા વિનંતીઓ છે, ચકાસાયેલ નોંધમાં સીધો ફેરફાર નહીં. ચકાસણી અને અમલની સ્થિતિ જોઈ શકો છો.",
  ],
  [
    "Can I enter real personal documents?",
    "શું હું વાસ્તવિક વ્યક્તિગત દસ્તાવેજો દાખલ કરી શકું?",
    "No. Use synthetic data and sample documents only. No Aadhaar, bank or caste details should be entered in this local demonstration.",
    "ના. માત્ર કૃત્રિમ માહિતી અને નમૂના દસ્તાવેજો વાપરો. આ નિદર્શનમાં આધાર, બેંક કે જાતિની વિગતો દાખલ ન કરો.",
  ],
];
export function Help() {
  const { t } = useApp();
  const [q, setQ] = useState("");
  return (
    <div className="container page">
      <Breadcrumb label={t("Help & support", "મદદ અને સહાય")} />
      <PageHeading
        eyebrow={t("Application status", "અરજીની સ્થિતિ")}
        title={t("How can we help?", "અમે કેવી રીતે મદદ કરી શકીએ?")}
        description={t(
          "Find answers, follow an application or report a problem.",
          "જવાબો મેળવો, અરજીની સ્થિતિ જુઓ અથવા સમસ્યા જણાવો.",
        )}
      />
      <div className="task-grid three">
        <Link to="/track" className="task-card">
          <ClipboardList />
          <h3>{t("Track a request", "વિનંતીની સ્થિતિ")}</h3>
          <ArrowRight />
        </Link>
        <Link to="/help/centres" className="task-card">
          <MapPin />
          <h3>{t("Assistance centres", "સહાય કેન્દ્રો")}</h3>
          <ArrowRight />
        </Link>
        <Link to="/grievances" className="task-card">
          <CircleHelp />
          <h3>{t("Report a problem", "સમસ્યા જણાવો")}</h3>
          <ArrowRight />
        </Link>
      </div>
      <section className="readable">
        <h2>{t("Frequently asked questions", "વારંવાર પૂછાતા પ્રશ્નો")}</h2>
        <Field label={t("Search questions", "પ્રશ્નો શોધો")}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("For example: ration card", "ઉદાહરણ: રેશન કાર્ડ")}
          />
        </Field>
        <div className="faq-list">
          {faq
            .filter((f) => f.join(" ").toLowerCase().includes(q.toLowerCase()))
            .map(([en, gu, a, ag]) => (
              <details key={en}>
                <summary>
                  {t(en, gu)}
                  <ChevronRight size={18} />
                </summary>
                <p>{t(a, ag)}</p>
              </details>
            ))}
        </div>
        <Notice>
          {t(
            "No public Family ID helpline has been assigned to this demonstration. Use the in-app grievance workflow for demo support cases; do not call unrelated government services for this demo.",
            "આ નિદર્શન માટે જાહેર પરિવાર ઓળખ હેલ્પલાઇન ફાળવાઈ નથી. નિદર્શન સહાય માટે એપની ફરિયાદ પ્રક્રિયા વાપરો; અસંબંધિત સરકારી સેવાઓને ફોન ન કરો.",
          )}
        </Notice>
      </section>
    </div>
  );
}

export function ContentPage({ slug: prop }: { slug?: string }) {
  const params = useParams();
  const slug = prop || params.slug || "about";
  const { t } = useApp();
  const result = useResource(
    () =>
      api<{
        title: string;
        title_gu: string;
        body: string;
        body_gu: string;
        updated_at: string;
      }>("/public/content/" + slug),
    [slug],
  );
  return (
    <div className="container page">
      <Breadcrumb label={t(slug.replaceAll("-", " "), "માહિતી")} />
      {result.loading ? (
        <Loading />
      ) : result.error ? (
        <ErrorBox error={result.error} retry={result.reload} />
      ) : (
        <>
          <PageHeading
            title={t(
              result.data!.title,
              result.data!.title_gu || result.data!.title,
            )}
            description={t(
              "Gujarat Kutumb Setu · Family information and services",
              "ગુજરાત કુટુંબ સેતુ · પરિવારની માહિતી અને સેવાઓ",
            )}
          />
          <article className="panel prose readable">
            {t(result.data!.body, result.data!.body_gu || result.data!.body)
              .split("\n")
              .filter(Boolean)
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            <small>
              {t("Last updated", "છેલ્લો સુધારો")}:{" "}
              {formatDate(result.data!.updated_at)}
            </small>
          </article>
        </>
      )}
      {slug === "accessibility" && <AccessibilityOptions />}
      {slug === "about" && (
        <Notice>
          {t(
            "Programme name approved for this project. Government identity assets, live service mandate, data-sharing permissions and production certification are not implied.",
            "આ પ્રોજેક્ટ માટે કાર્યક્રમનું નામ મંજૂર છે. સરકારી ઓળખ ચિહ્નો, વાસ્તવિક સેવાની સત્તા, માહિતી વહેંચવાની પરવાનગી કે પ્રમાણપત્રનો દાવો નથી.",
          )}
        </Notice>
      )}
    </div>
  );
}
function AccessibilityOptions() {
  const { t } = useApp();
  const [size, setSize] = useState(100);
  const [contrast, setContrast] = useState(false);
  return (
    <section className="panel readable">
      <h2>{t("Reading preferences", "વાંચન પસંદગીઓ")}</h2>
      <div className="form-actions">
        <button
          className="button outline"
          onClick={() => {
            const n = Math.min(150, size + 10);
            setSize(n);
            document.documentElement.style.fontSize = n + "%";
          }}
        >
          {t("Larger text", "મોટા અક્ષરો")} A+
        </button>
        <button
          className="button outline"
          onClick={() => {
            setContrast(!contrast);
            document.documentElement.classList.toggle("high-contrast");
          }}
        >
          {t("Toggle high contrast", "ઉચ્ચ કોન્ટ્રાસ્ટ બદલો")}
        </button>
        <button
          className="button outline"
          onClick={() => {
            setSize(100);
            setContrast(false);
            document.documentElement.style.fontSize = "100%";
            document.documentElement.classList.remove("high-contrast");
          }}
        >
          {t("Reset", "રીસેટ")}
        </button>
      </div>
      <p>
        {t(
          "Keyboard: Tab moves between controls; Enter activates a link; Space operates a button. The skip link jumps to the main content.",
          "કીબોર્ડ: Tab નિયંત્રણો વચ્ચે લઈ જાય છે; Enter કડી ખોલે છે; Space બટન ચલાવે છે. મુખ્ય વિષયની કડી સીધી વિષય પર લઈ જાય છે.",
        )}
      </p>
    </section>
  );
}

export function Centres() {
  const { t } = useApp();
  const [q, setQ] = useState("");
  const result = useResource(() =>
    api<{
      centres: {
        id?: string;
        name: string;
        district: string;
        address?: string;
        hours?: string;
        services?: string[];
      }[];
    }>("/public/config"),
  );
  return (
    <div className="container page">
      <Breadcrumb label={t("Assistance centres", "સહાય કેન્દ્રો")} />
      <PageHeading
        title={t("Assistance near you", "તમારી નજીક સહાય")}
        description={t(
          "Demonstration locations only. Confirm real centres with the appointed government owner before rollout.",
          "માત્ર નિદર્શન સ્થાનો. અમલ પહેલાં વાસ્તવિક કેન્દ્રો સંબંધિત સરકારી વિભાગ પાસેથી ચકાસવા જરૂરી છે.",
        )}
      />
      <Field
        label={t(
          "Filter by district or centre",
          "જિલ્લા અથવા કેન્દ્ર મુજબ શોધો",
        )}
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} />
      </Field>
      {result.loading ? (
        <Loading />
      ) : result.error ? (
        <ErrorBox error={result.error} />
      ) : (
        <div className="scheme-grid">
          {result.data?.centres
            .filter((c) =>
              JSON.stringify(c).toLowerCase().includes(q.toLowerCase()),
            )
            .map((c, i) => (
              <article className="panel" key={i}>
                <MapPin className="blue" />
                <h2>{c.name}</h2>
                <p>{c.district}</p>
                <p>{c.address}</p>
                <p>{c.hours}</p>
                <span className="tag">
                  {t("Synthetic centre", "કૃત્રિમ કેન્દ્ર")}
                </span>
              </article>
            ))}
        </div>
      )}
      <Notice>
        {t(
          "If you do not have a personal phone or need help, an authorized operator can support an assisted application. Confirm centre availability before visiting.",
          "તમારી પાસે વ્યક્તિગત ફોન ન હોય અથવા મદદ જોઈએ તો અધિકૃત ઓપરેટર સહાયિત અરજીમાં મદદ કરી શકે છે. મુલાકાત પહેલાં કેન્દ્રની ઉપલબ્ધતા ચકાસો.",
        )}
      </Notice>
      <Link className="button" to="/sign-in">
        {t("Sign in for assistance", "સહાય માટે પ્રવેશ કરો")}
      </Link>
    </div>
  );
}

export function Documents() {
  const { t } = useApp();
  return (
    <div className="container page">
      <Breadcrumb
        label={t("Guides & documents", "માર્ગદર્શિકા અને દસ્તાવેજો")}
      />
      <PageHeading
        title={t("Guides & documents", "માર્ગદર્શિકા અને દસ્તાવેજો")}
        description={t(
          "Accessible HTML guidance. No government orders are fabricated in this demonstration.",
          "સુલભ HTML માર્ગદર્શન. આ નિદર્શનમાં કોઈ બનાવટી સરકારી આદેશ નથી.",
        )}
      />
      <div className="list-panel">
        {[
          [
            "/services",
            t("Family registration guide", "પરિવાર નોંધણી માર્ગદર્શિકા"),
          ],
          ["/help", t("Frequently asked questions", "વારંવાર પૂછાતા પ્રશ્નો")],
          [
            "/developers/docs",
            t("Developer API guide", "ડેવલપર API માર્ગદર્શિકા"),
          ],
          [
            "/policies/privacy",
            t("Demonstration privacy notice", "નિદર્શન ગોપનીયતા સૂચના"),
          ],
        ].map(([url, title]) => (
          <Link key={url} to={url}>
            <ClipboardList />
            <span>
              <strong>{title}</strong>
              <small>HTML · ગુજરાતી / English</small>
            </span>
            <ArrowRight />
          </Link>
        ))}
      </div>
    </div>
  );
}
export function Sitemap() {
  const { t } = useApp();
  return (
    <div className="container page">
      <PageHeading title={t("Sitemap", "સાઇટમેપ")} />
      <div className="panel sitemap">
        {[
          ["/", "Home", "મુખ્ય પૃષ્ઠ"],
          ["/services", "Family services", "પરિવાર સેવાઓ"],
          ["/apply/start", "Apply", "અરજી"],
          ["/find-id", "Find ID", "ઓળખ શોધો"],
          ["/track", "Track", "સ્થિતિ"],
          ["/schemes", "Schemes", "યોજનાઓ"],
          ["/help", "Help", "મદદ"],
          ["/help/centres", "Centres", "કેન્દ્રો"],
          ["/about", "About", "વિશે"],
          ["/contact", "Contact", "સંપર્ક"],
          ["/accessibility", "Accessibility", "સુલભતા"],
          ["/policies/privacy", "Privacy", "ગોપનીયતા"],
          ["/documents", "Documents", "દસ્તાવેજો"],
          ["/grievances", "Grievances", "ફરિયાદો"],
          ["/developers/docs", "Developer docs", "ડેવલપર દસ્તાવેજો"],
        ].map(([url, en, gu]) => (
          <Link to={url} key={url}>
            {t(en, gu)}
            <ArrowRight size={15} />
          </Link>
        ))}
      </div>
    </div>
  );
}
export function SearchPage() {
  const { t } = useApp();
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const matches = [
    ...taskData.map(([url, en, gu, desc, descGu]) => ({
      url,
      title: t(en, gu),
      desc: t(desc, descGu),
      all: en + gu + desc + descGu,
    })),
    ...faq.map(([en, gu, a, ag]) => ({
      url: "/help",
      title: t(en, gu),
      desc: t(a, ag),
      all: en + gu + a + ag,
    })),
  ].filter((v) => v.all.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="container page">
      <PageHeading
        title={t("Search results", "શોધ પરિણામો")}
        description={t(
          "Public information only. No resident records are searched.",
          "માત્ર જાહેર માહિતી. કોઈ રહેવાસીની નોંધ શોધવામાં આવતી નથી.",
        )}
      />
      <p>
        {t("Results for", "માટે પરિણામ")}: <strong>{q}</strong>
      </p>
      {matches.length ? (
        matches.map((v) => (
          <Link key={v.title} className="search-result" to={v.url}>
            <h2>{v.title}</h2>
            <p>{v.desc}</p>
          </Link>
        ))
      ) : (
        <Empty
          title={t("No matching guidance", "સંબંધિત માર્ગદર્શન મળ્યું નથી")}
        >
          <Link to="/help">
            {t("Browse the help centre", "મદદ કેન્દ્ર જુઓ")}
          </Link>
        </Empty>
      )}
      <Link
        to={"/schemes?q=" + encodeURIComponent(q)}
        className="button outline"
      >
        {t("Search the scheme catalogue", "યોજના સૂચિમાં શોધો")}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
