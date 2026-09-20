import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Search,
  ShieldCheck,
} from "lucide-react";
import { api, send } from "./api";
import type { Application, List } from "./api";
import { useApp } from "./context";
import {
  BackLink,
  Empty,
  ErrorBox,
  Field,
  FormActions,
  Loading,
  Notice,
  PageHeading,
  Status,
  formatDate,
  useResource,
} from "./ui";
import { ApplicationList, PayloadSummary, Timeline } from "./ResidentPages";
import { EvidencePanel } from "./Enrollment";
export function Staff() {
  const { user } = useApp();
  return user?.role === "operator" ? <AssistedWorkspace /> : <ReviewQueue />;
}
function AssistedWorkspace() {
  const { t, user } = useApp();
  const requests = useResource(() => api<List<Application>>("/applications"));
  return (
    <div className="container page">
      <PageHeading
        eyebrow={t("Assisted-service workspace", "સહાયિત સેવા કાર્યસ્થળ")}
        title={t("Assisted family services", "સહાયિત પરિવાર સેવાઓ")}
        description={t(
          "Begin a resident-specific session, record authority and read back each application before submission.",
          "રહેવાસી-વિશિષ્ટ સત્ર શરૂ કરો, અધિકાર નોંધો અને મોકલતા પહેલાં દરેક અરજી વાંચી સંભળાવો.",
        )}
      >
        <Link className="button" to="/apply/start">
          {t("Begin assisted application", "સહાયિત અરજી શરૂ કરો")}
          <ArrowRight size={16} />
        </Link>
      </PageHeading>
      <Notice>
        <strong>
          {user?.display_name} · {user?.district}
        </strong>
        <p>
          {t(
            "Your operator account is separate from the resident's account. You may resume only applications you were authorized to handle; you cannot verify or approve them.",
            "તમારું ઓપરેટર ખાતું રહેવાસીના ખાતાથી અલગ છે. તમે માત્ર અધિકૃત અરજીઓ આગળ ભરી શકો છો; ચકાસણી કે મંજૂરી કરી શકતા નથી.",
          )}
        </p>
      </Notice>
      <section className="panel">
        <h2>
          {t("Applications handled by you", "તમારા દ્વારા સંભાળેલી અરજીઓ")}
        </h2>
        {requests.loading ? (
          <Loading />
        ) : requests.error ? (
          <ErrorBox error={requests.error} />
        ) : (
          <ApplicationList applications={requests.data?.items || []} />
        )}
      </section>
      <Link className="text-link" to="/grievances">
        {t("Grievance support", "ફરિયાદ સહાય")}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
function ReviewQueue() {
  const { t, user } = useApp();
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const result = useResource(
    () =>
      api<List<Application>>(
        `/staff/applications?status=${status}&q=${encodeURIComponent(search)}&page=${page}`,
      ),
    [status, search, page],
  );
  const report = useResource(() =>
    api<{
      counts: Record<string, number>;
      district: string;
      as_of: string;
      notice: string;
    }>("/staff/reports"),
  );
  return (
    <div className="container page">
      <PageHeading
        eyebrow={t("Authorized workspace", "અધિકૃત કાર્યસ્થળ")}
        title={t("Application work queue", "અરજી કાર્ય સૂચિ")}
        description={t(
          "Review assigned requests with a recorded purpose, evidence and reasoned decisions.",
          "નોંધાયેલ હેતુ, પુરાવા અને કારણસર નિર્ણય સાથે સોંપાયેલ વિનંતીઓ તપાસો.",
        )}
      />
      <div className="tab-nav">
        <Link className="active" to="/staff">
          {t("Applications", "અરજીઓ")}
        </Link>
        <Link to="/grievances">{t("Grievances", "ફરિયાદો")}</Link>
        {user?.role === "admin" && (
          <Link to="/admin">{t("Administration", "વહીવટ")}</Link>
        )}
        {user?.role === "operator" && (
          <Link to="/apply/start">
            {t("Assisted enrollment", "સહાયિત નોંધણી")}
          </Link>
        )}
      </div>
      <Notice>
        <strong>
          {t("Your role", "તમારી ભૂમિકા")}: {user?.role} ·{" "}
          {t("Jurisdiction", "કાર્યક્ષેત્ર")}:{" "}
          {user?.district || t("Authorized scope", "અધિકૃત મર્યાદા")}
        </strong>
        <p>
          {t(
            "Verification and approval are separate. The server enforces jurisdiction, record revision and separation of duties.",
            "ચકાસણી અને મંજૂરી અલગ છે. સર્વર કાર્યક્ષેત્ર, નોંધ આવૃત્તિ અને ફરજોનું વિભાજન અમલમાં રાખે છે.",
          )}
        </p>
      </Notice>
      {report.data && (
        <div className="metric-grid">
          {[
            ["submitted", t("Awaiting review", "ચકાસણી બાકી")],
            ["under_verification", t("Under verification", "ચકાસણી હેઠળ")],
            ["verified", t("Awaiting approval", "મંજૂરી બાકી")],
          ].map(([k, label]) => (
            <div className="metric" key={k}>
              <span>{label}</span>
              <strong>{report.data!.counts[k] || 0}</strong>
            </div>
          ))}
        </div>
      )}
      <form
        className="filter-bar"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(query);
          setPage(1);
        }}
      >
        <Field label={t("Application reference", "અરજી નંબર")}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </Field>
        <Field label={t("State", "સ્થિતિ")}>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">
              {t("All assigned states", "બધી સોંપાયેલ સ્થિતિ")}
            </option>
            {[
              "submitted",
              "under_verification",
              "needs_information",
              "verified",
              "implemented",
              "rejected",
              "appealed",
            ].map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </Field>
        <button className="button">
          <Search size={16} />
          {t("Filter queue", "સૂચિ ફિલ્ટર")}
        </button>
      </form>
      {result.loading ? (
        <Loading />
      ) : result.error ? (
        <ErrorBox error={result.error} retry={result.reload} />
      ) : result.data?.items.length ? (
        <>
          <div
            className="table-wrap"
            role="region"
            aria-label={t("Assigned application queue", "સોંપાયેલ અરજી સૂચિ")}
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th>{t("Reference / type", "નંબર / પ્રકાર")}</th>
                  <th>{t("District", "જિલ્લો")}</th>
                  <th>{t("State", "સ્થિતિ")}</th>
                  <th>{t("Received / updated", "પ્રાપ્ત / સુધારેલ")}</th>
                  <th>{t("Action", "કાર્ય")}</th>
                </tr>
              </thead>
              <tbody>
                {result.data.items.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>
                        {a.reference || t("Saved draft", "સાચવેલો ડ્રાફ્ટ")}
                      </strong>
                      <small>{a.kind}</small>
                    </td>
                    <td>{a.district}</td>
                    <td>
                      <Status value={a.status} />
                    </td>
                    <td>{formatDate(a.updated_at)}</td>
                    <td>
                      <Link
                        to={"/staff/applications/" + a.id}
                        className="text-link"
                      >
                        {t("Open case", "કેસ ખોલો")}
                        <ArrowRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <FormActions>
            <button
              className="button outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {t("Previous", "પાછલું")}
            </button>
            <span>
              {t("Page", "પૃષ્ઠ")} {page} · {result.data.total}{" "}
              {t("requests", "વિનંતી")}
            </span>
            <button
              className="button outline"
              disabled={page * result.data.page_size >= result.data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("Next", "આગળ")}
            </button>
          </FormActions>
        </>
      ) : (
        <Empty title={t("No cases in this queue", "આ સૂચિમાં કોઈ કેસ નથી")}>
          <p>
            {t(
              "Try another state filter. Other jurisdictions and unrelated records are not included.",
              "બીજી સ્થિતિ પસંદ કરો. બીજા કાર્યક્ષેત્ર અને અસંબંધિત નોંધો સામેલ નથી.",
            )}
          </p>
        </Empty>
      )}
    </div>
  );
}
export function StaffCase() {
  const { id } = useParams();
  const { t, user } = useApp();
  const result = useResource(
    () => api<Application>("/applications/" + id),
    [id],
  );
  const [action, setAction] = useState("start_review");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [key, setKey] = useState(() => crypto.randomUUID());
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await send(
        "/staff/applications/" + id + "/action",
        { action, reason, revision: result.data!.revision },
        "POST",
        key,
      );
      setSuccess(
        t(
          "Decision recorded. The case history has been updated.",
          "નિર્ણય નોંધાયો. કેસનો ઇતિહાસ સુધારાયો છે.",
        ),
      );
      setReason("");
      setConfirmed(false);
      setKey(crypto.randomUUID());
      result.reload();
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
  const a = result.data!;
  const allowed: string[] = [];
  if (user?.role === "verifier") {
    if (["submitted", "appealed"].includes(a.status))
      allowed.push("start_review");
    if (a.status === "under_verification")
      allowed.push("verify", "request_information", "reject");
  }
  if (user?.role === "approver") {
    if (a.status === "verified")
      allowed.push("approve", "request_information", "reject");
  }
  const labels: Record<string, [string, string]> = {
    start_review: ["Start verification", "ચકાસણી શરૂ કરો"],
    verify: ["Complete verification", "ચકાસણી પૂર્ણ કરો"],
    request_information: ["Request information", "માહિતી માંગો"],
    approve: ["Approve and implement", "મંજૂર કરો અને અમલ કરો"],
    reject: ["Reject with reason", "કારણ સાથે નામંજૂર"],
  };
  return (
    <div className="container page">
      <BackLink
        to="/staff"
        label={t("Back to assigned queue", "સોંપાયેલ સૂચિ પર પાછા")}
      />
      <PageHeading
        eyebrow={t("Case review", "કેસ ચકાસણી")}
        title={a.reference || t("Application", "અરજી")}
        description={`${a.district} · ${a.kind} · ${t("Revision", "આવૃત્તિ")} ${a.revision}`}
      >
        <Status value={a.status} />
      </PageHeading>
      {success && <Notice type="success">{success}</Notice>}
      <div className="content-with-aside">
        <div>
          <div className="panel">
            <h2>
              {t(
                "Application evidence and declarations",
                "અરજીના પુરાવા અને જાહેરાતો",
              )}
            </h2>
            <PayloadSummary payload={a.payload} />
          </div>
          <div className="panel">
            <EvidencePanel applicationId={id!} readonly />
          </div>
          {allowed.length ? (
            <form className="staff-actions" onSubmit={(e) => void submit(e)}>
              <h2>
                <ShieldCheck size={22} />{" "}
                {t("Record your action", "તમારું કાર્ય નોંધો")}
              </h2>
              <Field label={t("Action", "કાર્ય")} required>
                <select
                  value={allowed.includes(action) ? action : ""}
                  onChange={(e) => {
                    setAction(e.target.value);
                    setConfirmed(false);
                    setKey(crypto.randomUUID());
                  }}
                  required
                >
                  <option value="">
                    {t("Select an action", "કાર્ય પસંદ કરો")}
                  </option>
                  {allowed.map((v) => (
                    <option key={v} value={v}>
                      {t(...labels[v])}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={t("Evidence-based reason", "પુરાવા આધારિત કારણ")}
                required
                help={t(
                  "The applicant may see this reason. Do not include unrelated sensitive details.",
                  "અરજદારને આ કારણ દેખાઈ શકે છે. અસંબંધિત સંવેદનશીલ વિગતો ન આપો.",
                )}
              >
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  minLength={5}
                  maxLength={2000}
                  required
                />
              </Field>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  required
                />
                {t(
                  "I have reviewed the current evidence and am authorized to perform this action.",
                  "મેં વર્તમાન પુરાવા તપાસ્યા છે અને મને આ કાર્ય કરવાનો અધિકાર છે.",
                )}
              </label>
              {Boolean(error) && <ErrorBox error={error} />}
              <button
                className="button"
                disabled={busy || !confirmed || !allowed.includes(action)}
              >
                {busy
                  ? t("Recording…", "નોંધી રહ્યું છે…")
                  : t(
                      "Confirm and record action",
                      "પુષ્ટિ કરો અને કાર્ય નોંધો",
                    )}
                <CheckCircle2 size={17} />
              </button>
            </form>
          ) : (
            <Notice>
              {t(
                "No decision action is currently available for your role and this case state. The case remains visible within your authorized review scope.",
                "તમારી ભૂમિકા અને કેસની સ્થિતિ માટે હાલ કોઈ નિર્ણય કાર્ય ઉપલબ્ધ નથી. અધિકૃત મર્યાદામાં કેસ દેખાય છે.",
              )}
            </Notice>
          )}
        </div>
        <aside>
          <div className="panel">
            <h2>{t("Decision history", "નિર્ણય ઇતિહાસ")}</h2>
            <Timeline events={a.events || []} />
          </div>
          <Notice>
            {t(
              "Do not change certified source data through this screen. Conflicts require a source-owner correction path.",
              "આ સ્ક્રીનથી પ્રમાણિત સ્ત્રોત માહિતી બદલશો નહીં. વિવાદ માટે સ્ત્રોત વિભાગની સુધારા પ્રક્રિયા જરૂરી છે.",
            )}
          </Notice>
        </aside>
      </div>
    </div>
  );
}

interface Grievance {
  id: string;
  reference: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  response?: string;
  created_at: string;
  updated_at: string;
  history?: { status: string; response: string; created_at: string }[];
}
export function Grievances() {
  const { t, user } = useApp();
  const navigate = useNavigate();
  const result = useResource(
    () =>
      user
        ? api<List<Grievance>>("/grievances")
        : Promise.resolve({ items: [], total: 0, page: 1, page_size: 20 }),
    [user?.id],
  );
  const [category, setCategory] = useState("application");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const g = await send<Grievance>("/grievances", {
        category,
        subject,
        description,
      });
      navigate("/grievances/" + g.id);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container page">
      <PageHeading
        eyebrow={t("Help, review and redress", "મદદ, સમીક્ષા અને નિરાકરણ")}
        title={t("Grievances & feedback", "ફરિયાદો અને અભિપ્રાય")}
        description={t(
          "Report a problem with an application, a record or access to your information. You do not need a permanent Family ID.",
          "અરજી, નોંધ અથવા તમારી માહિતીના પ્રવેશની સમસ્યા જણાવો. કાયમી પરિવાર ઓળખ જરૂરી નથી.",
        )}
      />
      {!user ? (
        <div className="panel readable">
          <p>
            {t(
              "Sign in so we can give you a secure reference and response. No Family ID is required to create an account.",
              "સુરક્ષિત નંબર અને જવાબ આપવા માટે પ્રવેશ કરો. ખાતું બનાવવા પરિવાર ઓળખ જરૂરી નથી.",
            )}
          </p>
          <Link
            to="/sign-in"
            state={{ from: "/grievances" }}
            className="button"
          >
            {t("Sign in to report a problem", "સમસ્યા જણાવવા પ્રવેશ કરો")}
          </Link>
        </div>
      ) : (
        <div className="dashboard-grid">
          <div>
            <form className="panel" onSubmit={(e) => void submit(e)}>
              <h2>{t("Raise a new concern", "નવી સમસ્યા જણાવો")}</h2>
              <Field label={t("What is this about?", "આ શેના વિશે છે?")}>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {[
                    ["application", "Application or delay", "અરજી અથવા વિલંબ"],
                    ["correction", "Incorrect record", "ખોટી નોંધ"],
                    ["benefit", "Benefit report", "લાભનો અહેવાલ"],
                    ["privacy", "Privacy or access", "ગોપનીયતા અથવા પ્રવેશ"],
                    [
                      "staff_conduct",
                      "Staff conduct or charge",
                      "કર્મચારી વર્તન અથવા શુલ્ક",
                    ],
                    [
                      "technical",
                      "Website or accessibility",
                      "વેબસાઇટ અથવા સુલભતા",
                    ],
                    ["other", "Another concern", "બીજી સમસ્યા"],
                  ].map(([v, en, gu]) => (
                    <option key={v} value={v}>
                      {t(en, gu)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("Short subject", "ટૂંકો વિષય")} required>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  minLength={5}
                  maxLength={180}
                />
              </Field>
              <Field
                label={t("Describe the problem", "સમસ્યા વર્ણવો")}
                required
                help={t(
                  "Include a relevant reference, but never an OTP, password, Aadhaar or bank information.",
                  "સંબંધિત નંબર આપો, પરંતુ OTP, પાસવર્ડ, આધાર કે બેંકની માહિતી નહીં.",
                )}
              >
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={10}
                  maxLength={5000}
                />
              </Field>
              {["privacy", "staff_conduct"].includes(category) && (
                <Notice>
                  {t(
                    "This concern goes to restricted, independent administration review. It is not assigned to an ordinary operator.",
                    "આ સમસ્યા પ્રતિબંધિત, સ્વતંત્ર વહીવટી ચકાસણીમાં જાય છે. સામાન્ય ઓપરેટરને સોંપાતી નથી.",
                  )}
                </Notice>
              )}
              {Boolean(error) && <ErrorBox error={error} />}
              <button disabled={busy} className="button">
                {busy
                  ? t("Submitting…", "મોકલી રહ્યું છે…")
                  : t("Submit grievance", "ફરિયાદ મોકલો")}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
          <aside>
            <div className="panel">
              <h2>{t("Your accessible cases", "તમને અધિકૃત કેસ")}</h2>
              {result.loading ? (
                <Loading />
              ) : result.error ? (
                <ErrorBox error={result.error} />
              ) : result.data?.items.length ? (
                result.data.items.map((g) => (
                  <Link
                    key={g.id}
                    to={"/grievances/" + g.id}
                    className="request-row"
                  >
                    <ClipboardList size={18} />
                    <div>
                      <strong>{g.reference}</strong>
                      <small>{g.subject}</small>
                    </div>
                    <Status value={g.status} />
                  </Link>
                ))
              ) : (
                <Empty
                  title={t("No grievance cases yet", "હજુ કોઈ ફરિયાદ કેસ નથી")}
                />
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
export function GrievanceDetail() {
  const { id } = useParams();
  const { t, user } = useApp();
  const result = useResource(() => api<Grievance>("/grievances/" + id), [id]);
  const [status, setStatus] = useState("in_review");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const action = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await send("/staff/grievances/" + id + "/action", { status, response });
      setResponse("");
      result.reload();
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
  const g = result.data!;
  return (
    <div className="container page">
      <BackLink
        to="/grievances"
        label={t("Back to grievances", "ફરિયાદો પર પાછા")}
      />
      <PageHeading title={g.subject} description={g.reference}>
        <Status value={g.status} />
      </PageHeading>
      <div className="panel readable">
        <p>{g.description}</p>
        <small>
          {formatDate(g.created_at)} · {g.category}
        </small>
        <hr />
        <h2>{t("Response", "જવાબ")}</h2>
        {g.response ? (
          <Notice>{g.response}</Notice>
        ) : (
          <p className="muted">
            {t(
              "Your case is recorded. A response will appear here after the assigned authority reviews it.",
              "તમારો કેસ નોંધાયેલ છે. સોંપાયેલ અધિકારીની ચકાસણી પછી જવાબ અહીં દેખાશે.",
            )}
          </p>
        )}
        {g.history?.map((h, i) => (
          <div className="dashboard-notification" key={i}>
            <Status value={h.status} />
            <p>{h.response}</p>
            <small>{formatDate(h.created_at)}</small>
          </div>
        ))}
      </div>
      {["admin", "verifier", "approver"].includes(user?.role || "") && (
        <form className="panel readable" onSubmit={(e) => void action(e)}>
          <h2>{t("Record an authorized response", "અધિકૃત જવાબ નોંધો")}</h2>
          <Field label={t("Case state", "કેસની સ્થિતિ")}>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="in_review">
                {t("Under review", "સમીક્ષા હેઠળ")}
              </option>
              <option value="resolved">{t("Resolved", "નિરાકરણ")}</option>
              <option value="reopened">{t("Reopened", "ફરી ખોલેલ")}</option>
            </select>
          </Field>
          <Field label={t("Reasoned response", "કારણસર જવાબ")} required>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              minLength={10}
              required
            />
          </Field>
          {Boolean(error) && <ErrorBox error={error} />}
          <button className="button" disabled={busy}>
            {t("Record response", "જવાબ નોંધો")}
          </button>
        </form>
      )}
    </div>
  );
}
