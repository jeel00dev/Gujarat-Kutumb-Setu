import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Code2,
  FileText,
  KeyRound,
  Plus,
  Settings2,
} from "lucide-react";
import { api, send } from "./api";
import type { List, Scheme } from "./api";
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
interface Content {
  slug: string;
  title: string;
  title_gu: string;
  body: string;
  body_gu: string;
  revision: number;
  updated_at: string;
}
interface IntegrationClient {
  id: string;
  name: string;
  purpose: string;
  requested_scopes: string[];
  approved_scopes: string[];
  status: string;
  created_at: string;
  expires_at: string;
  credential?: string;
}
export function Admin() {
  const { t } = useApp();
  const result = useResource(() =>
    api<{
      counts: Record<string, number>;
      recent_audit?: Record<string, unknown>[];
      outbox?: Record<string, unknown>;
      integration_health?: Record<string, unknown>;
    }>("/admin/overview"),
  );
  const audit = useResource(() =>
    api<List<Record<string, unknown>>>("/admin/audit"),
  );
  return (
    <div className="container page">
      <PageHeading
        eyebrow={t("Governance workspace", "સંચાલન કાર્યસ્થળ")}
        title={t("Administration", "વહીવટ")}
        description={t(
          "Manage bilingual content, approved services and scoped integration access.",
          "દ્વિભાષી સામગ્રી, મંજૂર સેવાઓ અને મર્યાદિત જોડાણ પ્રવેશ સંભાળો.",
        )}
      />
      <div className="task-grid">
        {[
          [
            "/admin/content",
            t("Content publishing", "સામગ્રી પ્રકાશન"),
            FileText,
          ],
          ["/admin/schemes", t("Scheme catalogue", "યોજના સૂચિ"), Settings2],
          [
            "/departments",
            t("Integration requests", "જોડાણ વિનંતીઓ"),
            KeyRound,
          ],
        ].map(([url, label, Icon]) => {
          const I = Icon as typeof FileText;
          return (
            <Link key={String(url)} to={String(url)} className="task-card">
              <I size={25} />
              <h3>{String(label)}</h3>
              <ArrowRight size={17} />
            </Link>
          );
        })}
      </div>
      {result.loading ? (
        <Loading />
      ) : result.error ? (
        <ErrorBox error={result.error} />
      ) : (
        <>
          <Notice>
            {t(
              "These are administrative registry counts for this environment, not census population statistics.",
              "આ વાતાવરણ માટે આ વહીવટી નોંધણીના આંકડા છે, વસ્તી ગણતરીના આંકડા નહીં.",
            )}
          </Notice>
          <div className="metric-grid">
            {Object.entries(result.data?.counts || {}).map(([key, value]) => (
              <div className="metric" key={key}>
                <span>{key.replaceAll("_", " ")}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </>
      )}
      <section className="panel">
        <h2>{t("Recent accountable actions", "તાજેતરના જવાબદાર કાર્યો")}</h2>
        {audit.loading ? (
          <Loading />
        ) : audit.error ? (
          <ErrorBox error={audit.error} />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("Action", "કાર્ય")}</th>
                  <th>{t("Actor role", "કાર્યકર્તાની ભૂમિકા")}</th>
                  <th>{t("Purpose", "હેતુ")}</th>
                  <th>{t("Time", "સમય")}</th>
                </tr>
              </thead>
              <tbody>
                {audit.data?.items.map((a, i) => (
                  <tr key={i}>
                    <td>{String(a.action || "")}</td>
                    <td>{String(a.actor_role || "")}</td>
                    <td>{String(a.purpose || "")}</td>
                    <td>{formatDate(String(a.created_at || ""))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Link className="text-link" to="/staff">
        {t("Open application work queue", "અરજી કાર્ય સૂચિ ખોલો")}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
export function ContentAdmin() {
  const { t } = useApp();
  const result = useResource(() => api<List<Content>>("/admin/content"));
  const [edit, setEdit] = useState<Content | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    setBusy(true);
    setError(null);
    try {
      const { title, title_gu, body, body_gu, revision } = edit;
      await send(
        "/admin/content/" + edit.slug,
        { title, title_gu, body, body_gu, revision },
        "PUT",
      );
      setEdit(null);
      setMessage(
        t(
          "Bilingual content published. Previous version retained.",
          "દ્વિભાષી સામગ્રી પ્રકાશિત થઈ. જૂની આવૃત્તિ જાળવેલી છે.",
        ),
      );
      result.reload();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container page">
      <BackLink
        to="/admin"
        label={t("Back to administration", "વહીવટ પર પાછા")}
      />
      <PageHeading
        title={t("Bilingual content publishing", "દ્વિભાષી સામગ્રી પ્રકાશન")}
        description={t(
          "English and Gujarati are published together. Confirm the content owner’s approval before saving.",
          "અંગ્રેજી અને ગુજરાતી સાથે પ્રકાશિત થાય છે. સાચવતા પહેલાં માલિકની મંજૂરીની પુષ્ટિ કરો.",
        )}
      />
      {message && <Notice type="success">{message}</Notice>}
      {result.loading ? (
        <Loading />
      ) : result.error ? (
        <ErrorBox error={result.error} />
      ) : edit ? (
        <form className="panel" onSubmit={(e) => void save(e)}>
          <div className="form-grid">
            {(["title", "title_gu"] as const).map((k) => (
              <Field
                key={k}
                label={
                  k === "title"
                    ? t("Title · English", "શીર્ષક · English")
                    : t("Title · Gujarati", "શીર્ષક · ગુજરાતી")
                }
                required
              >
                <input
                  value={edit[k]}
                  onChange={(e) => setEdit({ ...edit, [k]: e.target.value })}
                  required
                  minLength={2}
                  maxLength={180}
                />
              </Field>
            ))}
            {(["body", "body_gu"] as const).map((k) => (
              <Field
                key={k}
                label={
                  k === "body"
                    ? t("Body · English", "મુખ્ય ભાગ · English")
                    : t("Body · Gujarati", "મુખ્ય ભાગ · ગુજરાતી")
                }
                required
              >
                <textarea
                  rows={13}
                  value={edit[k]}
                  onChange={(e) => setEdit({ ...edit, [k]: e.target.value })}
                  required
                  minLength={10}
                  maxLength={30000}
                />
              </Field>
            ))}
          </div>
          <Notice>
            {t(
              "Plain text only. Scripts and embedded third-party content are not part of this editor. A stale revision cannot overwrite a newer publication.",
              "માત્ર સાદું લખાણ. સ્ક્રિપ્ટ અને બહારની સામગ્રી આ સંપાદકમાં નથી. જૂની આવૃત્તિ નવી પ્રકાશિત નોંધને બદલી શકતી નથી.",
            )}
          </Notice>
          {Boolean(error) && <ErrorBox error={error} />}
          <FormActions>
            <button className="button" disabled={busy}>
              {t("Publish reviewed content", "ચકાસાયેલ સામગ્રી પ્રકાશિત કરો")}
            </button>
            <button
              type="button"
              className="button outline"
              onClick={() => setEdit(null)}
            >
              {t("Cancel", "રદ કરો")}
            </button>
          </FormActions>
        </form>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("Content page", "સામગ્રી પૃષ્ઠ")}</th>
                <th>{t("Gujarati title", "ગુજરાતી શીર્ષક")}</th>
                <th>{t("Revision", "આવૃત્તિ")}</th>
                <th>{t("Action", "કાર્ય")}</th>
              </tr>
            </thead>
            <tbody>
              {result.data?.items.map((c) => (
                <tr key={c.slug}>
                  <td>
                    <strong>{c.title}</strong>
                    <small>{c.slug}</small>
                  </td>
                  <td>{c.title_gu}</td>
                  <td>{c.revision}</td>
                  <td>
                    <button
                      className="button outline small"
                      onClick={() => {
                        setEdit(c);
                        setError(null);
                        setMessage("");
                      }}
                    >
                      {t("Review & edit", "ચકાસો અને સુધારો")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
const blankScheme = () => ({
  slug: "",
  name: "",
  name_gu: "",
  department: "",
  category: "social_welfare",
  summary: "",
  summary_gu: "",
  benefit_type: "service",
  eligibility: [] as string[],
  documents: [] as string[],
  source_url: "",
  application_url: "",
  status: "draft",
  capability: "information_only",
});
export function SchemeAdmin() {
  const { t } = useApp();
  const result = useResource(() => api<List<Scheme>>("/admin/schemes"));
  const [edit, setEdit] = useState<ReturnType<typeof blankScheme> | null>(null);
  const [editing, setEditing] = useState<Scheme | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    setBusy(true);
    setError(null);
    try {
      const body = { ...edit, application_url: edit.application_url || null };
      await send(
        editing ? "/admin/schemes/" + editing.id : "/admin/schemes",
        editing ? { ...body, revision: editing.revision } : body,
        editing ? "PATCH" : "POST",
      );
      setEdit(null);
      setMessage(
        t(
          "Scheme configuration saved. Publication state and capability were recorded.",
          "યોજનાનું રૂપરેખાંકન સાચવાયું. પ્રકાશન સ્થિતિ અને ક્ષમતા નોંધાઈ.",
        ),
      );
      result.reload();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container page">
      <BackLink
        to="/admin"
        label={t("Back to administration", "વહીવટ પર પાછા")}
      />
      <PageHeading
        title={t("Scheme catalogue administration", "યોજના સૂચિ વહીવટ")}
        description={t(
          "New services reuse the catalogue without changing family identity. Content and connector capability are distinct.",
          "પરિવારની ઓળખ બદલ્યા વિના નવી સેવાઓ સૂચિ વાપરે છે. સામગ્રી અને જોડાણ ક્ષમતા અલગ છે.",
        )}
      >
        <button
          className="button"
          onClick={() => {
            setEditing(null);
            setEdit(blankScheme());
            setMessage("");
          }}
        >
          <Plus size={17} />
          {t("Add scheme", "યોજના ઉમેરો")}
        </button>
      </PageHeading>
      {message && <Notice type="success">{message}</Notice>}
      {result.loading ? (
        <Loading />
      ) : result.error ? (
        <ErrorBox error={result.error} />
      ) : edit ? (
        <form className="panel" onSubmit={(e) => void save(e)}>
          <div className="form-grid">
            {(
              [
                ["name", "Name · English", "નામ · English"],
                ["name_gu", "Name · Gujarati", "નામ · ગુજરાતી"],
                ["slug", "Stable URL slug", "સ્થિર URL નામ"],
                ["department", "Owning department", "જવાબદાર વિભાગ"],
                ["category", "Discovery category", "શોધ વિભાગ"],
                [
                  "source_url",
                  "Authoritative HTTPS source",
                  "અધિકૃત HTTPS સ્ત્રોત",
                ],
              ] as const
            ).map(([k, en, gu]) => (
              <Field key={k} label={t(en, gu)} required>
                <input
                  value={edit[k]}
                  onChange={(e) => setEdit({ ...edit, [k]: e.target.value })}
                  required
                />
              </Field>
            ))}
            <Field label={t("Summary · English", "સારાંશ · English")} required>
              <textarea
                value={edit.summary}
                onChange={(e) => setEdit({ ...edit, summary: e.target.value })}
                minLength={10}
                required
              />
            </Field>
            <Field label={t("Summary · Gujarati", "સારાંશ · ગુજરાતી")} required>
              <textarea
                value={edit.summary_gu}
                onChange={(e) =>
                  setEdit({ ...edit, summary_gu: e.target.value })
                }
                minLength={10}
                required
              />
            </Field>
            <Field
              label={t(
                "Eligibility guidance · one item per line",
                "પાત્રતા માર્ગદર્શન · દરેક લીટીમાં એક મુદ્દો",
              )}
            >
              <textarea
                value={edit.eligibility.join("\n")}
                onChange={(e) =>
                  setEdit({ ...edit, eligibility: e.target.value.split("\n") })
                }
              />
            </Field>
            <Field
              label={t(
                "Evidence · one item per line",
                "પુરાવા · દરેક લીટીમાં એક મુદ્દો",
              )}
            >
              <textarea
                value={edit.documents.join("\n")}
                onChange={(e) =>
                  setEdit({ ...edit, documents: e.target.value.split("\n") })
                }
              />
            </Field>
            <Field label={t("Benefit type", "સહાયનો પ્રકાર")}>
              <select
                value={edit.benefit_type}
                onChange={(e) =>
                  setEdit({ ...edit, benefit_type: e.target.value })
                }
              >
                <option value="service">Service</option>
                <option value="in_kind">In-kind</option>
                <option value="cash">Cash</option>
              </select>
            </Field>
            <Field label={t("Publication state", "પ્રકાશન સ્થિતિ")}>
              <select
                value={edit.status}
                onChange={(e) => setEdit({ ...edit, status: e.target.value })}
              >
                {["draft", "published", "suspended", "retired"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label={t("Connection capability", "જોડાણ ક્ષમતા")}>
              <select
                value={edit.capability}
                onChange={(e) =>
                  setEdit({ ...edit, capability: e.target.value })
                }
              >
                <option value="information_only">Information only</option>
                <option value="external">External owner application</option>
                <option value="demo_connected">
                  Connected · simulated provider
                </option>
              </select>
            </Field>
            <Field
              label={t(
                "Application URL (if external)",
                "અરજી URL (બહારની હોય તો)",
              )}
            >
              <input
                type="url"
                value={edit.application_url}
                onChange={(e) =>
                  setEdit({ ...edit, application_url: e.target.value })
                }
              />
            </Field>
          </div>
          {Boolean(error) && <ErrorBox error={error} />}
          <FormActions>
            <button className="button" disabled={busy}>
              {t("Save reviewed configuration", "ચકાસાયેલ રૂપરેખાંકન સાચવો")}
            </button>
            <button
              className="button outline"
              type="button"
              onClick={() => setEdit(null)}
            >
              {t("Cancel", "રદ કરો")}
            </button>
          </FormActions>
        </form>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("Scheme", "યોજના")}</th>
                <th>{t("Department", "વિભાગ")}</th>
                <th>{t("State / capability", "સ્થિતિ / ક્ષમતા")}</th>
                <th>{t("Action", "કાર્ય")}</th>
              </tr>
            </thead>
            <tbody>
              {result.data?.items.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.name}</strong>
                    <small>{s.name_gu}</small>
                  </td>
                  <td>{s.department}</td>
                  <td>
                    <Status value={s.status} />
                    <small>{s.capability}</small>
                  </td>
                  <td>
                    <button
                      className="button outline small"
                      onClick={() => {
                        setEditing(s);
                        setEdit({
                          ...blankScheme(),
                          ...s,
                          eligibility: Array.isArray(s.eligibility)
                            ? s.eligibility
                            : [s.eligibility],
                          documents: Array.isArray(s.documents)
                            ? s.documents
                            : [s.documents],
                          application_url: s.application_url || "",
                        });
                        setError(null);
                      }}
                    >
                      {t("Edit", "સુધારો")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export function Departments() {
  const { t, user } = useApp();
  const allowed = user && ["department", "admin"].includes(user.role);
  const result = useResource(
    () =>
      allowed
        ? api<List<IntegrationClient>>("/departments/clients")
        : Promise.resolve({ items: [], total: 0, page: 1, page_size: 20 }),
    [user?.id],
  );
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [benefits, setBenefits] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [credential, setCredential] = useState("");
  const [message, setMessage] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await send("/departments/clients", {
        name,
        purpose,
        requested_scopes: benefits
          ? ["family:verify", "benefits:write"]
          : ["family:verify"],
      });
      setName("");
      setPurpose("");
      setMessage(
        t(
          "Onboarding request submitted for review. No credentials are active yet.",
          "જોડાણની વિનંતી ચકાસણી માટે મોકલાઈ. ઓળખ હજી સક્રિય નથી.",
        ),
      );
      result.reload();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  const action = async (id: string, type: string) => {
    setBusy(true);
    setError(null);
    try {
      const r = await send<IntegrationClient>(
        "/admin/clients/" + id + "/" + type,
        {},
      );
      if (r.credential) setCredential(r.credential);
      else
        setMessage(
          t(
            "Client access revoked. Existing credentials no longer authorize requests.",
            "ક્લાયન્ટ પ્રવેશ રદ કર્યો. જૂની ઓળખથી વિનંતી અધિકૃત નથી.",
          ),
        );
      result.reload();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container page">
      <PageHeading
        eyebrow={t("Connected government services", "જોડાયેલ સરકારી સેવાઓ")}
        title={t("Department & developer services", "વિભાગ અને ડેવલપર સેવાઓ")}
        description={t(
          "Purpose-bound integration, clear contracts and minimum necessary information.",
          "હેતુ આધારિત જોડાણ, સ્પષ્ટ કરાર અને લઘુતમ જરૂરી માહિતી.",
        )}
      >
        <Link className="button outline" to="/developers/docs">
          <Code2 size={18} />
          {t("API documentation", "API દસ્તાવેજો")}
        </Link>
      </PageHeading>
      <div className="process-grid">
        <div>
          <span className="step-number">01</span>
          <h3>{t("Declare purpose", "હેતુ જણાવો")}</h3>
          <p>
            {t(
              "Define your owner, service and needed fields.",
              "માલિક, સેવા અને જરૂરી ક્ષેત્ર નક્કી કરો.",
            )}
          </p>
        </div>
        <div>
          <span className="step-number">02</span>
          <h3>{t("Review scope", "મર્યાદા ચકાસો")}</h3>
          <p>
            {t(
              "Approve minimum scopes and jurisdiction.",
              "લઘુતમ અધિકાર અને કાર્યક્ષેત્ર મંજૂર કરો.",
            )}
          </p>
        </div>
        <div>
          <span className="step-number">03</span>
          <h3>{t("Test the contract", "કરાર ચકાસો")}</h3>
          <p>
            {t(
              "Verify synthetic cases and failure paths.",
              "કૃત્રિમ કેસ અને નિષ્ફળતા તપાસો.",
            )}
          </p>
        </div>
        <div>
          <span className="step-number">04</span>
          <h3>{t("Activate & monitor", "સક્રિય કરો અને નિરીક્ષણ")}</h3>
          <p>
            {t(
              "Issue scoped, revocable access.",
              "મર્યાદિત, રદ કરી શકાય તેવો પ્રવેશ આપો.",
            )}
          </p>
        </div>
      </div>
      <hr />
      {!allowed ? (
        <div className="panel readable">
          <h2>
            {t(
              "Use your assigned department account",
              "ફાળવેલું વિભાગ ખાતું વાપરો",
            )}
          </h2>
          <p>
            {t(
              "Knowing a Family ID does not grant access to personal information. Department credentials and an approved purpose are required.",
              "પરિવાર ઓળખ જાણવાથી વ્યક્તિગત માહિતીનો અધિકાર મળતો નથી. વિભાગની ઓળખ અને મંજૂર હેતુ જરૂરી છે.",
            )}
          </p>
          <Link
            className="button"
            to="/sign-in"
            state={{ from: "/departments" }}
          >
            {t("Department sign in", "વિભાગ પ્રવેશ")}
          </Link>
        </div>
      ) : (
        <>
          {message && <Notice type="success">{message}</Notice>}
          {credential && (
            <Notice type="warning">
              <strong>
                {t(
                  "Credential shown once — store securely",
                  "ઓળખ એક વખત બતાવાય છે — સુરક્ષિત રાખો",
                )}
              </strong>
              <p className="credential-value">{credential}</p>
              <button
                className="button outline small"
                onClick={() => setCredential("")}
              >
                {t(
                  "I have stored it securely; hide",
                  "મેં સુરક્ષિત સાચવ્યું છે; છુપાવો",
                )}
              </button>
            </Notice>
          )}
          {Boolean(error) && <ErrorBox error={error} />}
          <div className="form-actions">
            <Link className="button outline" to="/staff/payments">
              {t(
                "Scheme decisions & payment register",
                "યોજના નિર્ણયો અને ચુકવણી નોંધણી",
              )}
              <ArrowRight size={16} />
            </Link>
          </div>
          <section className="panel">
            <h2>{t("Integration clients", "જોડાણ ક્લાયન્ટ")}</h2>
            {result.loading ? (
              <Loading />
            ) : result.error ? (
              <ErrorBox error={result.error} />
            ) : result.data?.items.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t("Service / purpose", "સેવા / હેતુ")}</th>
                      <th>{t("Scope", "મર્યાદા")}</th>
                      <th>{t("State", "સ્થિતિ")}</th>
                      {user?.role === "admin" && (
                        <th>{t("Action", "કાર્ય")}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.items.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.name}</strong>
                          <small>{c.purpose}</small>
                          <small>
                            {t("Expires", "સમાપ્તિ")}:{" "}
                            {formatDate(c.expires_at)}
                          </small>
                        </td>
                        <td>
                          {(c.approved_scopes?.length
                            ? c.approved_scopes
                            : c.requested_scopes
                          ).map((s) => (
                            <small key={s}>{s}</small>
                          ))}
                        </td>
                        <td>
                          <Status value={c.status} />
                        </td>
                        {user?.role === "admin" && (
                          <td>
                            {c.status === "pending" ? (
                              <button
                                className="button small"
                                disabled={busy}
                                onClick={() => void action(c.id, "approve")}
                              >
                                {t(
                                  "Approve requested scope",
                                  "વિનંતી મર્યાદા મંજૂર",
                                )}
                              </button>
                            ) : c.status === "active" ? (
                              <button
                                className="button outline small"
                                disabled={busy}
                                onClick={() => void action(c.id, "revoke")}
                              >
                                {t("Revoke access", "પ્રવેશ રદ કરો")}
                              </button>
                            ) : null}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                title={t(
                  "No integration requests yet",
                  "હજુ કોઈ જોડાણ વિનંતી નથી",
                )}
              />
            )}
          </section>
          {user?.role === "department" && (
            <form className="panel readable" onSubmit={(e) => void submit(e)}>
              <h2>
                {t("Request a service integration", "સેવા જોડાણની વિનંતી")}
              </h2>
              <Field
                label={t(
                  "Service / application name",
                  "સેવા / એપ્લિકેશનનું નામ",
                )}
                required
              >
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={3}
                  maxLength={150}
                  required
                />
              </Field>
              <Field
                label={t("Specific authorized purpose", "ચોક્કસ અધિકૃત હેતુ")}
                required
              >
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  minLength={10}
                  maxLength={300}
                  required
                />
              </Field>
              <p>
                <Check size={16} />{" "}
                {t(
                  "Requested scope: minimum family status verification",
                  "વિનંતી મર્યાદા: લઘુતમ પરિવાર સ્થિતિ ચકાસણી",
                )}
              </p>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={benefits}
                  onChange={(e) => setBenefits(e.target.checked)}
                />
                {t(
                  "Also request benefit-reporting scope (subject to scheme-specific approval)",
                  "લાભ અહેવાલની મર્યાદા પણ માંગો (યોજનાની ચોક્કસ મંજૂરી હેઠળ)",
                )}
              </label>
              <button className="button" disabled={busy}>
                {t("Submit for review", "ચકાસણી માટે મોકલો")}
                <ArrowRight size={17} />
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
export function DeveloperDocs() {
  const { t } = useApp();
  return (
    <div className="container page">
      <BackLink
        to="/departments"
        label={t("Back to department services", "વિભાગ સેવાઓ પર પાછા")}
      />
      <PageHeading
        eyebrow={t("Versioned API contract", "આવૃત્ત API કરાર")}
        title={t("Build a connected service", "જોડાયેલ સેવા બનાવો")}
        description={t(
          "Same-origin citizen APIs and scoped department integrations. Synthetic testing comes before activation.",
          "સમાન મૂળની રહેવાસી API અને મર્યાદિત વિભાગ જોડાણ. સક્રિયતા પહેલાં કૃત્રિમ પરીક્ષણ.",
        )}
      />
      <div className="content-with-aside">
        <article className="panel prose">
          <h2>{t("Identity, purpose and scope", "ઓળખ, હેતુ અને મર્યાદા")}</h2>
          <p>
            {t(
              "Citizen sessions use an HttpOnly cookie. Authorized writes require the session CSRF token. Department integrations use a purpose-approved bearer credential. A public Family ID is never a credential.",
              "રહેવાસી સત્ર HttpOnly કૂકી વાપરે છે. અધિકૃત લખાણ માટે સત્ર CSRF ટોકન જરૂરી છે. વિભાગ જોડાણ મંજૂર હેતુવાળી bearer ઓળખ વાપરે છે. જાહેર પરિવાર ઓળખ પ્રવેશ ઓળખ નથી.",
            )}
          </p>
          <h2>
            {t(
              "Verify a family’s current status",
              "પરિવારની વર્તમાન સ્થિતિ ચકાસો",
            )}
          </h2>
          <pre className="code-block">
            {
              'POST /api/v1/integration/resolve\nAuthorization: Bearer <approved-credential>\nContent-Type: application/json\n\n{\n  "public_id": "<synthetic-family-id>",\n  "purpose": "Approved service status verification"\n}\n\n// Scope: family:verify\n// Returns status, member_count and as_of.\n// Does not disclose a full household profile.'
            }
          </pre>
          <h2>
            {t(
              "Safe retries and evolving contracts",
              "સુરક્ષિત પુનઃપ્રયાસ અને બદલાતા કરાર",
            )}
          </h2>
          <ul className="plain-list">
            <li>
              {t(
                "Send Idempotency-Key for submission, decision and referral intents. Reuse the same key after a timeout.",
                "અરજી, નિર્ણય અને રેફરલ માટે Idempotency-Key મોકલો. સમયસમાપ્તિ પછી એ જ કી વાપરો.",
              )}
            </li>
            <li>
              {t(
                "Send the current record revision when changing a draft or making a decision. Conflict returns HTTP 409.",
                "ડ્રાફ્ટ બદલતા કે નિર્ણય કરતા વર્તમાન નોંધ આવૃત્તિ મોકલો. વિવાદ HTTP 409 આપે છે.",
              )}
            </li>
            <li>
              {t(
                "Lists are bounded and paginated. Unauthorized object access returns no record contents.",
                "સૂચિ મર્યાદિત અને પૃષ્ઠોવાળી છે. બિનઅધિકૃત પ્રવેશ નોંધની વિગતો આપતો નથી.",
              )}
            </li>
            <li>
              {t(
                "Benefit reports need their own approved scope, selected scheme and unique source transaction.",
                "લાભ અહેવાલને અલગ મંજૂર મર્યાદા, પસંદ કરેલી યોજના અને અનન્ય સ્ત્રોત વ્યવહાર જરૂરી છે.",
              )}
            </li>
          </ul>
          <h2>{t("Response and error conventions", "જવાબ અને ભૂલના નિયમો")}</h2>
          <pre className="code-block">
            {
              '200 / 201   Successful read / committed creation\n401         Authentication required\n403 / 404   Forbidden or unavailable protected object\n409         Revision or state conflict\n422         Validation or policy failure\n429         Rate limit — retry after the allowed interval\n\nList: { "items": [], "total": 0, "page": 1, "page_size": 20 }\nError: { "detail": "Safe actionable message", "code": "optional_code" }'
            }
          </pre>
        </article>
        <aside>
          <div className="panel">
            <Code2 className="blue" size={29} />
            <h2>
              {t("Machine-readable contract", "મશીન વાંચી શકે તેવો કરાર")}
            </h2>
            <p>
              {t(
                "The deployed API schema is generated by the running backend and reflects implemented endpoints.",
                "અમલમાં આવેલી API સ્કીમા ચાલતા બેકએન્ડથી બને છે અને અમલી અંતબિંદુ દર્શાવે છે.",
              )}
            </p>
            <a
              href="/api/v1/openapi.json"
              className="button outline full"
              target="_blank"
              rel="noreferrer"
            >
              {t("Open API schema", "API સ્કીમા ખોલો")}
            </a>
            <hr />
            <Link to="/departments" className="text-link">
              {t("Request onboarding", "જોડાણની વિનંતી")}
              <ArrowRight size={16} />
            </Link>
          </div>
          <Notice>
            {t(
              "No real Aadhaar, PDS, treasury or payment gateway is connected in this test environment. Replace only approved provider adapters; do not bypass scope and policy controls.",
              "આ પરીક્ષણ વાતાવરણમાં વાસ્તવિક આધાર, PDS, તિજોરી કે ચુકવણી પ્રદાતા જોડાયેલ નથી. માત્ર મંજૂર પ્રદાતા એડેપ્ટર બદલો; મર્યાદા અને નીતિ નિયંત્રણો ટાળશો નહીં.",
            )}
          </Notice>
        </aside>
      </div>
    </div>
  );
}
