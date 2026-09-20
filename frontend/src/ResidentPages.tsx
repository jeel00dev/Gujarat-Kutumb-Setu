import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  ClipboardList,
  FilePenLine,
  Printer,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { api, send } from "./api";
import type { Address, Application, Family, List } from "./api";
import { useApp } from "./context";
import {
  BackLink,
  Breadcrumb,
  DetailList,
  Empty,
  ErrorBox,
  Field,
  FormActions,
  Loading,
  Notice,
  PageHeading,
  Pagination,
  Status,
  formatDate,
  useResource,
} from "./ui";
interface Notification {
  id: string;
  title: string;
  body: string;
  message?: string;
  created_at: string;
  read_at?: string;
  read?: boolean;
}
interface DashboardData {
  family: Family | null;
  applications: Application[];
  notifications: Notification[];
  counts: Record<string, number>;
}
export function Dashboard() {
  const { t, user } = useApp();
  const result = useResource(() => api<DashboardData>("/dashboard"));
  return (
    <div className="container page">
      <Breadcrumb label={t("My dashboard", "મારું ડેશબોર્ડ")} />
      <PageHeading
        eyebrow={t("Family services overview", "પરિવાર સેવાઓનો સાર")}
        title={t(
          `Welcome, ${user?.display_name.split(" ")[0] || ""}`,
          `સ્વાગત છે, ${user?.display_name || ""}`,
        )}
        description={t(
          "Review your family record, application history and required actions.",
          "તમારી પરિવાર નોંધ, અરજી ઇતિહાસ અને જરૂરી કાર્યો જુઓ.",
        )}
      >
        <Link to="/apply/start" className="button">
          <FilePenLine size={17} />
          {t("New application", "નવી અરજી")}
        </Link>
      </PageHeading>
      {result.loading ? (
        <Loading />
      ) : result.error ? (
        <ErrorBox error={result.error} retry={result.reload} />
      ) : (
        <>
          <div className="metric-grid">
            <div className="metric">
              <span>{t("Your applications", "તમારી અરજીઓ")}</span>
              <strong>{result.data?.applications.length || 0}</strong>
            </div>
            <div className="metric">
              <span>{t("Awaiting action", "કાર્ય બાકી")}</span>
              <strong>
                {result.data?.applications.filter((a) =>
                  ["draft", "needs_information"].includes(a.status),
                ).length || 0}
              </strong>
            </div>
            <div className="metric">
              <span>{t("Family members", "પરિવારના સભ્યો")}</span>
              <strong>{result.data?.family?.members.length || "—"}</strong>
            </div>
          </div>
          <div className="dashboard-grid">
            <div>
              {result.data?.family ? (
                <FamilySummary family={result.data.family} />
              ) : (
                <div className="family-summary">
                  <UsersRound size={28} />
                  <h2>
                    {t(
                      "No approved family record",
                      "મંજૂર પરિવાર નોંધ ઉપલબ્ધ નથી",
                    )}
                  </h2>
                  <p>
                    {t(
                      "No approved family record is linked to this account yet. Check for an existing record, or continue a saved application.",
                      "આ ખાતા સાથે હજુ મંજૂર પરિવાર નોંધ જોડાયેલી નથી. હાલની નોંધ તપાસો અથવા સાચવેલી અરજી આગળ ભરો.",
                    )}
                  </p>
                  <Link to="/find-id" className="text-link">
                    {t("Check an existing record", "હાલની નોંધ તપાસો")}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
              <section className="panel">
                <div className="section-heading">
                  <h2>{t("Recent applications", "તાજેતરની અરજીઓ")}</h2>
                  <Link to="/my/applications" className="text-link">
                    {t("View all", "બધી જુઓ")}
                  </Link>
                </div>
                <ApplicationList
                  applications={result.data?.applications.slice(0, 5) || []}
                />
              </section>
            </div>
            <aside>
              <div className="panel">
                <h2>{t("Quick actions", "ઝડપી કાર્યો")}</h2>
                <div className="side-links">
                  {[
                    [
                      "/my/family",
                      t("View family information", "પરિવારની માહિતી જુઓ"),
                    ],
                    [
                      "/my/changes/new",
                      t("Request a correction", "સુધારાની વિનંતી કરો"),
                    ],
                    [
                      "/my/benefits",
                      t("View benefit history", "લાભનો ઇતિહાસ જુઓ"),
                    ],
                    ["/my/payments", t("Payment status", "ચુકવણીની સ્થિતિ")],
                    [
                      "/my/permissions",
                      t(
                        "Privacy & access history",
                        "ગોપનીયતા અને પ્રવેશ ઇતિહાસ",
                      ),
                    ],
                    ["/grievances", t("Report a problem", "સમસ્યા જણાવો")],
                  ].map(([url, label]) => (
                    <Link key={url} to={url}>
                      {label}
                      <ArrowRight size={15} />
                    </Link>
                  ))}
                </div>
              </div>
              <div className="panel">
                <h2>
                  <Bell size={19} /> {t("Updates for you", "તમારા માટે માહિતી")}
                </h2>
                {result.data?.notifications.length ? (
                  result.data.notifications.slice(0, 4).map((n) => (
                    <div className="dashboard-notification" key={n.id}>
                      <strong>{n.title}</strong>
                      <p>{n.body || n.message}</p>
                      <small>{formatDate(n.created_at)}</small>
                    </div>
                  ))
                ) : (
                  <p className="muted">
                    {t(
                      "No new updates. Changes to your requests will appear here.",
                      "નવી માહિતી નથી. તમારી વિનંતીઓની માહિતી અહીં દેખાશે.",
                    )}
                  </p>
                )}
                <Link to="/my/notifications" className="text-link">
                  {t("All notifications", "બધી સૂચનાઓ")}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
function FamilySummary({ family }: { family: Family }) {
  const { t } = useApp();
  return (
    <section className="family-summary">
      <div className="family-summary-header">
        <div>
          <span className="eyebrow">
            {t("Your Family ID", "તમારી પરિવાર ઓળખ")}
          </span>
          <div className="family-id">{family.public_id}</div>
        </div>
        <Status value={family.status} />
      </div>
      <hr />
      <div className="family-summary-header">
        <span>
          {family.members.length} {t("members", "સભ્યો")} ·{" "}
          {family.address.district}
        </span>
        <Link to="/my/family" className="text-link">
          {t("View family", "પરિવાર જુઓ")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
export function ApplicationList({
  applications,
}: {
  applications: Application[];
}) {
  const { t } = useApp();
  return applications.length ? (
    <div className="request-list">
      {applications.map((a) => (
        <Link
          className="request-row"
          key={a.id}
          to={
            a.status === "draft" && a.kind === "enrollment"
              ? "/apply/" + a.id
              : "/my/applications/" + a.id
          }
        >
          <ClipboardList size={25} />
          <div>
            <strong>
              {a.reference || t("Saved application", "સાચવેલી અરજી")}
            </strong>
            <small>
              {a.kind === "enrollment"
                ? t("Family registration", "પરિવાર નોંધણી")
                : t("Change request", "સુધારાની વિનંતી")}{" "}
              · {formatDate(a.updated_at)}
            </small>
          </div>
          <Status value={a.status} />
          <ArrowRight size={16} />
        </Link>
      ))}
    </div>
  ) : (
    <Empty title={t("No applications yet", "હજુ કોઈ અરજી નથી")}>
      <p>
        {t(
          "A saved or submitted request will appear here.",
          "સાચવેલી અથવા મોકલેલી વિનંતી અહીં દેખાશે.",
        )}
      </p>
      <Link to="/apply/start" className="button outline">
        {t("Start an application", "અરજી શરૂ કરો")}
      </Link>
    </Empty>
  );
}
export function Applications() {
  const { t } = useApp();
  const [page, setPage] = useState(1);
  const result = useResource(
    () => api<List<Application>>("/applications?page=" + page),
    [page],
  );
  return (
    <div className="container page">
      <BackLink />
      <PageHeading
        title={t("My applications", "મારી અરજીઓ")}
        description={t(
          "Drafts are not submitted. Each submitted request has its own tracking reference.",
          "ડ્રાફ્ટ મોકલેલી અરજી નથી. દરેક મોકલેલી વિનંતીને પોતાનો નંબર હોય છે.",
        )}
      />
      <div className="panel">
        {result.loading ? (
          <Loading />
        ) : result.error ? (
          <ErrorBox error={result.error} retry={result.reload} />
        ) : (
          <>
            <ApplicationList applications={result.data?.items || []} />
            {result.data && (
              <Pagination
                page={page}
                total={result.data.total}
                pageSize={result.data.page_size}
                onChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
export function FamilyPage() {
  const { t } = useApp();
  const result = useResource(() => api<Family>("/families/mine"));
  return (
    <div className="container page">
      <BackLink />
      <PageHeading
        title={t("My family information", "મારા પરિવારની માહિતી")}
        description={t(
          "Verified information changes only after an authorized request is implemented.",
          "ચકાસાયેલ માહિતી અધિકૃત વિનંતી અમલમાં આવ્યા પછી જ બદલાય છે.",
        )}
      >
        <button className="button outline" onClick={() => window.print()}>
          <Printer size={17} />
          {t("Print summary", "સારાંશ છાપો")}
        </button>
      </PageHeading>
      {result.loading ? (
        <Loading />
      ) : result.error ? (
        <>
          <Notice>
            {t(
              "No family record is available to this account. Complete registration or get help with an existing link.",
              "આ ખાતા માટે પરિવારની નોંધ ઉપલબ્ધ નથી. નોંધણી પૂર્ણ કરો અથવા હાલની કડી માટે મદદ મેળવો.",
            )}
          </Notice>
          <Link className="button" to="/my/applications">
            {t("View applications", "અરજીઓ જુઓ")}
          </Link>
        </>
      ) : (
        <>
          <div className="content-with-aside">
            <div>
              <FamilySummary family={result.data!} />
              <section className="panel">
                <h2>{t("Family members", "પરિવારના સભ્યો")}</h2>
                <div
                  className="table-wrap"
                  tabIndex={0}
                  role="region"
                  aria-label={t("Family members", "પરિવારના સભ્યો")}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>{t("Name", "નામ")}</th>
                        <th>{t("Relationship", "સંબંધ")}</th>
                        <th>{t("Date of birth", "જન્મ તારીખ")}</th>
                        <th>{t("State", "સ્થિતિ")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.data?.members.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <strong>{m.name}</strong>
                            {m.name_gu && <small>{m.name_gu}</small>}
                            <small>{m.public_id}</small>
                          </td>
                          <td>{m.relationship}</td>
                          <td>{formatDate(m.dob)}</td>
                          <td>
                            <Status value={m.status || "active"} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Notice>
                  {t(
                    "Only permitted family information is displayed. Another adult’s restricted certificates, bank details and benefits are not included.",
                    "માત્ર અનુમતિ ધરાવતી પરિવાર માહિતી બતાવવામાં આવે છે. બીજા પુખ્ત સભ્યના પ્રતિબંધિત પ્રમાણપત્રો, બેંક અને લાભની વિગતો સામેલ નથી.",
                  )}
                </Notice>
              </section>
            </div>
            <aside>
              <div className="panel">
                <h2>{t("Registered residence", "નોંધાયેલ રહેઠાણ")}</h2>
                <p>
                  {result.data?.address.address_line}
                  <br />
                  {result.data?.address.locality}
                  <br />
                  {result.data?.address.taluka}, {result.data?.address.district}
                  <br />
                  {result.data?.address.pincode}
                </p>
                <small>
                  {t("Last updated", "છેલ્લો સુધારો")}:{" "}
                  {formatDate(result.data?.updated_at)}
                </small>
                <hr />
                <Link className="button outline full" to="/my/changes/new">
                  {t("Request a change", "સુધારાની વિનંતી")}
                </Link>
              </div>
              <Notice>
                {t(
                  "This identity does not by itself establish a benefit, domicile, caste status or citizenship.",
                  "આ ઓળખ પોતે લાભ, રહેવાસ, જાતિ કે નાગરિકતા સ્થાપિત કરતી નથી.",
                )}
              </Notice>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
export function Track() {
  const { t, user } = useApp();
  const [q, setQ] = useState("");
  const [searched, setSearched] = useState(false);
  const [reference, setReference] = useState("");
  const result = useResource(
    () =>
      user
        ? reference
          ? api<Application>(
              "/applications/track?reference=" + encodeURIComponent(reference),
            ).then((application) => ({
              items: [application],
              total: 1,
              page: 1,
              page_size: 1,
            }))
          : api<List<Application>>("/applications")
        : Promise.resolve({ items: [], total: 0, page: 1, page_size: 20 }),
    [user?.id, reference],
  );
  const matches = result.data?.items || [];
  return (
    <div className="container page">
      <Breadcrumb label={t("Track application", "અરજીની સ્થિતિ")} />
      <PageHeading
        title={t(
          "Track or resume your application",
          "અરજીની સ્થિતિ જુઓ અથવા આગળ ભરો",
        )}
        description={t(
          "View the current stage, any action required and the decision history.",
          "વર્તમાન તબક્કો, જરૂરી કાર્યવાહી અને નિર્ણયનો ઇતિહાસ જુઓ.",
        )}
      />
      <div className="readable panel">
        {!user ? (
          <>
            <Notice>
              {t(
                "Sign in before viewing personal application information. A reference alone cannot reveal someone’s records.",
                "વ્યક્તિગત અરજીની માહિતી જોવા પહેલાં પ્રવેશ કરો. માત્ર અરજી નંબરથી કોઈની નોંધ દેખાતી નથી.",
              )}
            </Notice>
            <Link className="button" to="/sign-in" state={{ from: "/track" }}>
              {t("Sign in to track", "સ્થિતિ જોવા પ્રવેશ કરો")}
            </Link>
          </>
        ) : (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setReference(q.trim());
                setSearched(true);
              }}
            >
              <Field
                label={t("Application reference", "અરજી નંબર")}
                help={t(
                  "Enter the complete reference, or leave blank for recent requests.",
                  "પૂરો અરજી નંબર આપો અથવા તાજેતરની વિનંતી માટે ખાલી રાખો.",
                )}
              >
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="KS-…"
                />
              </Field>
              <button className="button">
                {t("Find my application", "મારી અરજી શોધો")}
                <ArrowRight size={16} />
              </button>
            </form>
            {searched &&
              (result.loading ? (
                <Loading />
              ) : result.error ? (
                <ErrorBox error={result.error} />
              ) : (
                <ApplicationList applications={matches} />
              ))}
            <hr />
            <Link className="text-link" to="/my/applications">
              {t("Continue a saved draft", "સાચવેલો ડ્રાફ્ટ આગળ ભરો")}
              <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
export function FindId() {
  const { t, user } = useApp();
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<{
    result: string;
    message: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setResult(await send("/registry/check", { reference }));
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container page">
      <Breadcrumb label={t("Find Family ID", "પરિવાર ઓળખ શોધો")} />
      <PageHeading
        title={t("Find an existing family record", "હાલની પરિવાર નોંધ શોધો")}
        description={t(
          "Checking first helps avoid duplicate registration. You can only view records you are allowed to access.",
          "પહેલાં તપાસ કરવાથી ફરી નોંધણી ટાળી શકાય છે. તમને અધિકૃત નોંધ જ દેખાશે.",
        )}
      />
      <div className="panel readable">
        {!user ? (
          <>
            <p>
              {t(
                "Sign in with your mobile number or Family ID before checking a private record.",
                "વ્યક્તિગત નોંધ તપાસતા પહેલાં મોબાઇલ નંબર અથવા પરિવાર ઓળખથી પ્રવેશ કરો.",
              )}
            </p>
            <Link to="/sign-in" state={{ from: "/find-id" }} className="button">
              {t("Sign in and check", "પ્રવેશ કરો અને તપાસો")}
            </Link>
          </>
        ) : (
          <form onSubmit={(e) => void check(e)}>
            <Field
              label={t(
                "Family ID or ration reference",
                "પરિવાર ઓળખ અથવા રેશન નંબર",
              )}
              required
              help={t(
                "External ration-provider checks use synthetic source records in this environment.",
                "આ વાતાવરણમાં બહારના રેશન પ્રદાતાની તપાસ કૃત્રિમ નોંધથી થાય છે.",
              )}
            >
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
              />
            </Field>
            <button disabled={busy} className="button">
              {busy
                ? t("Checking…", "તપાસી રહ્યું છે…")
                : t("Check my record", "મારી નોંધ તપાસો")}
            </button>
          </form>
        )}
        {Boolean(error) && <ErrorBox error={error} />}{" "}
        {result && (
          <Notice type={result.result === "existing" ? "success" : "info"}>
            <strong>{result.message}</strong>
            <p>
              {result.result === "existing" ? (
                <Link to="/my/family">
                  {t("View my family", "મારો પરિવાર જુઓ")}
                </Link>
              ) : (
                <Link to="/apply/start">
                  {t("Review registration options", "નોંધણીના વિકલ્પો જુઓ")}
                </Link>
              )}
            </p>
          </Notice>
        )}
        <hr />
        <h2>
          {t("No ration card, or not sure?", "રેશન કાર્ડ નથી અથવા ખાતરી નથી?")}
        </h2>
        <p>
          {t(
            "You can use the independent registration route. An unavailable source check is not a finding that no family exists.",
            "તમે સ્વતંત્ર નોંધણીનો વિકલ્પ વાપરી શકો છો. સ્ત્રોત તપાસ ઉપલબ્ધ ન હોય તેનો અર્થ પરિવારની નોંધ નથી તેવો નથી.",
          )}
        </p>
        <Link className="text-link" to="/apply/start">
          {t("Explore registration options", "નોંધણીના વિકલ્પો જાણો")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
export function ApplicationDetail({ receipt = false }: { receipt?: boolean }) {
  const { id } = useParams();
  const { t } = useApp();
  const result = useResource(
    () => api<Application>("/applications/" + id),
    [id],
  );
  const [reason, setReason] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const action = async (type: string) => {
    setBusy(true);
    setError(null);
    try {
      await send("/applications/" + id + "/" + type, {
        revision: result.data!.revision,
        reason,
      });
      setReason("");
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
  return (
    <div className="container page">
      <BackLink
        to="/my/applications"
        label={t("Back to applications", "અરજીઓ પર પાછા")}
      />
      <div className="print-only print-header">
        <h2>Gujarat Kutumb Setu · ગુજરાત કુટુંબ સેતુ</h2>
        <p>
          {t(
            "Test environment · synthetic record",
            "પરીક્ષણ વાતાવરણ · કૃત્રિમ નોંધ",
          )}
        </p>
      </div>
      <PageHeading
        eyebrow={
          a.kind === "enrollment"
            ? t("Family registration", "પરિવાર નોંધણી")
            : t("Change request", "સુધારાની વિનંતી")
        }
        title={
          receipt
            ? t("Application acknowledgement", "અરજીની સ્વીકૃતિ")
            : t("Application details", "અરજીની વિગતો")
        }
        description={t(
          "Your reference, current state and recorded next steps.",
          "તમારો નંબર, વર્તમાન સ્થિતિ અને નોંધાયેલા આગળના પગલાં.",
        )}
      >
        <button onClick={() => window.print()} className="button outline">
          <Printer size={17} />
          {t("Print receipt", "રસીદ છાપો")}
        </button>
      </PageHeading>
      <div className="content-with-aside">
        <div>
          <div className="panel">
            <div className="family-summary-header">
              <div>
                <small>{t("Application reference", "અરજી નંબર")}</small>
                <div className="receipt-reference">
                  {a.reference ||
                    t("Draft — not submitted", "ડ્રાફ્ટ — મોકલેલી નથી")}
                </div>
              </div>
              <Status value={a.status} />
            </div>
            <hr />
            <DetailList
              items={[
                [t("District", "જિલ્લો"), a.district],
                [t("Last updated", "છેલ્લો સુધારો"), formatDate(a.updated_at)],
                [t("Submitted", "મોકલેલી"), formatDate(a.submitted_at)],
                [t("Record revision", "નોંધ આવૃત્તિ"), a.revision],
              ]}
            />
            {["draft", "needs_information"].includes(a.status) && (
              <Link
                className="button"
                to={
                  a.kind === "enrollment"
                    ? "/apply/" + a.id
                    : "/my/changes/" + a.id + "/edit"
                }
              >
                {t("Continue application", "અરજી આગળ ભરો")}
                <ArrowRight size={16} />
              </Link>
            )}
            {a.status === "implemented" && (
              <Notice type="success">
                <strong>
                  {t(
                    "Your request has been implemented.",
                    "તમારી વિનંતી અમલમાં આવી છે.",
                  )}
                </strong>
                <p>
                  <Link to="/my/family">
                    {t(
                      "View current family information",
                      "વર્તમાન પરિવાર માહિતી જુઓ",
                    )}
                  </Link>
                </p>
              </Notice>
            )}
          </div>
          <div className="panel">
            <h2>{t("Submitted details", "મોકલેલી વિગતો")}</h2>
            <PayloadSummary payload={a.payload} />
          </div>
          {!receipt &&
            ["draft", "submitted", "needs_information", "rejected"].includes(
              a.status,
            ) && (
              <div className="panel no-print">
                <h2>
                  {a.status === "rejected"
                    ? t("Request a review", "સમીક્ષાની વિનંતી")
                    : t("Need to withdraw?", "પાછી ખેંચવી છે?")}
                </h2>
                <p>
                  {t(
                    "A reason is recorded in the application history. This does not delete previous decisions.",
                    "કારણ અરજીના ઇતિહાસમાં નોંધાય છે. આ પહેલાના નિર્ણયો કાઢી નાખતું નથી.",
                  )}
                </p>
                <Field label={t("Reason", "કારણ")} required>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    minLength={5}
                  />
                </Field>
                <button
                  disabled={busy || reason.trim().length < 5}
                  className="button outline"
                  onClick={() =>
                    void action(a.status === "rejected" ? "appeal" : "withdraw")
                  }
                >
                  {a.status === "rejected"
                    ? t("Submit an appeal", "અપીલ મોકલો")
                    : t("Withdraw application", "અરજી પાછી ખેંચો")}
                </button>
                {Boolean(error) && <ErrorBox error={error} />}
              </div>
            )}
        </div>
        <aside>
          <div className="panel">
            <h2>{t("Application history", "અરજી ઇતિહાસ")}</h2>
            <Timeline events={a.events || []} />
          </div>
          <Notice>
            {t(
              "A receipt confirms submission, not approval. A Family ID is issued only after the designated decision.",
              "રસીદ અરજીની પુષ્ટિ છે, મંજૂરી નથી. નિયત નિર્ણય પછી જ પરિવાર ઓળખ આપવામાં આવે છે.",
            )}
          </Notice>
          <Link className="text-link no-print" to="/grievances">
            {t("Ask for help with this request", "આ વિનંતી માટે મદદ માંગો")}
            <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
export function Timeline({ events }: { events: Application["events"] }) {
  const { t } = useApp();
  return (
    <ol className="timeline">
      {events.length ? (
        events.map((e, i) => (
          <li key={e.id || i}>
            <Status value={e.to_status} />
            <p>{e.reason}</p>
            <small>
              {formatDate(e.created_at)} · {e.actor_role}
            </small>
          </li>
        ))
      ) : (
        <li>
          <strong>{t("Draft created", "ડ્રાફ્ટ બનાવેલ")}</strong>
          <p>
            {t("Not submitted for review yet.", "હજુ ચકાસણી માટે મોકલેલ નથી.")}
          </p>
        </li>
      )}
    </ol>
  );
}
export function PayloadSummary({
  payload,
}: {
  payload: Record<string, unknown>;
}) {
  const { t } = useApp();
  const applicant = payload.applicant as
    { name?: string; name_gu?: string; phone?: string } | undefined;
  const address = payload.address as Address | undefined;
  const members = payload.members as
    | { name: string; name_gu?: string; dob: string; relationship: string }[]
    | undefined;
  return (
    <>
      {applicant && (
        <DetailList
          items={[
            [t("Applicant", "અરજદાર"), applicant.name],
            [t("Name in Gujarati", "ગુજરાતીમાં નામ"), applicant.name_gu],
            [t("Contact", "સંપર્ક"), applicant.phone],
          ]}
        />
      )}{" "}
      {address && (
        <>
          <h3 className="form-section">{t("Residence", "રહેઠાણ")}</h3>
          <p>
            {address.address_line}, {address.locality}
            <br />
            {address.taluka}, {address.district} · {address.pincode}
          </p>
        </>
      )}
      {members && (
        <>
          <h3 className="form-section">
            {t("Members", "સભ્યો")} ({members.length})
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("Name", "નામ")}</th>
                  <th>{t("Date of birth", "જન્મ તારીખ")}</th>
                  <th>{t("Relationship", "સંબંધ")}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={i}>
                    <td>
                      {m.name}
                      {m.name_gu && <small>{m.name_gu}</small>}
                    </td>
                    <td>{formatDate(m.dob)}</td>
                    <td>{m.relationship}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {!applicant && !address && !members && (
        <DetailList
          items={Object.entries(payload)
            .filter(([k]) => !["declarations"].includes(k))
            .map(([k, v]) => [
              k.replaceAll("_", " "),
              typeof v === "object" ? JSON.stringify(v) : String(v),
            ])}
        />
      )}
    </>
  );
}

interface Benefit {
  id: string;
  scheme_name: string;
  department: string;
  person_name: string;
  benefit_type: string;
  amount: string | null;
  currency: string;
  quantity?: number;
  unit?: string;
  period: string;
  status: string;
  reported_at: string;
  event_date: string;
  source_reference: string;
  coverage_note: string;
}
export function Benefits() {
  const { t } = useApp();
  const result = useResource(() => api<List<Benefit>>("/benefits"));
  const refs = useResource(() =>
    api<
      List<{
        id: string;
        reference: string;
        status: string;
        scheme_id: string;
        created_at: string;
      }>
    >("/scheme-applications"),
  );
  return (
    <div className="container page">
      <BackLink />
      <PageHeading
        title={t("Benefits & service history", "લાભ અને સેવાનો ઇતિહાસ")}
        description={t(
          "Reports for your authorized view, with the owning department and source date.",
          "તમને અધિકૃત અહેવાલો, સંબંધિત વિભાગ અને સ્ત્રોતની તારીખ સાથે.",
        )}
      />
      <Notice>
        {t(
          "This view contains reports from connected services only. A missing entry does not mean a benefit was not received. Scheme approval and payment are different states.",
          "આ દૃશ્યમાં માત્ર જોડાયેલ સેવાઓના અહેવાલ છે. નોંધ ન હોય તેનો અર્થ લાભ મળ્યો નથી એવો નથી. યોજનાની મંજૂરી અને ચુકવણી અલગ સ્થિતિ છે.",
        )}
      </Notice>
      {result.loading ? (
        <Loading />
      ) : result.error ? (
        <ErrorBox error={result.error} retry={result.reload} />
      ) : result.data?.items.length ? (
        <div
          className="table-wrap"
          tabIndex={0}
          role="region"
          aria-label={t("Benefit reports", "લાભ અહેવાલો")}
        >
          <table>
            <thead>
              <tr>
                <th>{t("Scheme / owner", "યોજના / વિભાગ")}</th>
                <th>{t("Person / period", "વ્યક્તિ / સમયગાળો")}</th>
                <th>{t("Reported benefit", "નોંધાયેલ લાભ")}</th>
                <th>{t("Status", "સ્થિતિ")}</th>
                <th>{t("Source report", "સ્ત્રોત અહેવાલ")}</th>
              </tr>
            </thead>
            <tbody>
              {result.data.items.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.scheme_name}</strong>
                    <small>{b.department}</small>
                  </td>
                  <td>
                    {b.person_name}
                    <small>{b.period}</small>
                  </td>
                  <td>
                    {b.amount
                      ? `${b.currency || "INR"} ${Number(b.amount).toLocaleString("en-IN")}`
                      : b.quantity
                        ? `${b.quantity} ${b.unit}`
                        : b.benefit_type}
                  </td>
                  <td>
                    <Status value={b.status} />
                  </td>
                  <td>
                    {formatDate(b.reported_at)}
                    <small>{b.source_reference}</small>
                    <small>{b.coverage_note}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title={t(
            "No benefit reports are available",
            "લાભના અહેવાલ ઉપલબ્ધ નથી",
          )}
        >
          <p>
            {t(
              "Explore schemes for information, or contact the owning service about missing reports.",
              "માહિતી માટે યોજનાઓ જાણો અથવા ગુમ અહેવાલ માટે સંબંધિત સેવાનો સંપર્ક કરો.",
            )}
          </p>
          <Link to="/schemes" className="button outline">
            {t("Explore schemes", "યોજનાઓ શોધો")}
          </Link>
        </Empty>
      )}
      <section className="panel">
        <h2>{t("Your scheme referrals", "તમારા યોજના રેફરલ")}</h2>
        {refs.loading ? (
          <Loading />
        ) : refs.error ? (
          <ErrorBox error={refs.error} />
        ) : refs.data?.items.length ? (
          refs.data.items.map((a) => (
            <div className="request-row" key={a.id}>
              <div>
                <strong>{a.reference}</strong>
                <small>{formatDate(a.created_at)}</small>
              </div>
              <Status value={a.status} />
            </div>
          ))
        ) : (
          <p className="muted">
            {t(
              "No connected-service referrals yet. Opening an external website does not submit an application here.",
              "હજુ જોડાયેલ સેવા રેફરલ નથી. બહારની વેબસાઇટ ખોલવાથી અહીં અરજી મોકલાતી નથી.",
            )}
          </p>
        )}
      </section>
      <Link to="/grievances" className="text-link">
        {t("Dispute a reported benefit", "નોંધાયેલ લાભ અંગે ફરિયાદ")}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export function Notifications() {
  const { t } = useApp();
  const result = useResource(() => api<List<Notification>>("/notifications"));
  const read = async (id: string) => {
    await send("/notifications/" + id + "/read", {});
    result.reload();
  };
  return (
    <div className="container page">
      <BackLink />
      <PageHeading title={t("Notifications", "સૂચનાઓ")} />
      <section className="panel readable">
        {result.loading ? (
          <Loading />
        ) : result.error ? (
          <ErrorBox error={result.error} />
        ) : result.data?.items.length ? (
          result.data.items.map((n) => (
            <article className="dashboard-notification" key={n.id}>
              <h3>{n.title}</h3>
              <p>{n.body || n.message}</p>
              <small>{formatDate(n.created_at)}</small>
              {!n.read && !n.read_at && (
                <button className="text-button" onClick={() => void read(n.id)}>
                  {t("Mark as read", "વાંચેલું ચિહ્નિત કરો")}
                </button>
              )}
            </article>
          ))
        ) : (
          <Empty title={t("You are up to date", "નવી સૂચના નથી")} />
        )}
      </section>
    </div>
  );
}
export function Permissions() {
  const { t } = useApp();
  const result = useResource(() =>
    api<List<Record<string, unknown>>>("/access-history"),
  );
  return (
    <div className="container page">
      <BackLink />
      <PageHeading
        title={t("Privacy & access history", "ગોપનીયતા અને પ્રવેશ ઇતિહાસ")}
        description={t(
          "See recorded access within your permitted scope. Family membership does not give unrestricted authority over another adult.",
          "તમારી અનુમતિની મર્યાદામાં નોંધાયેલ પ્રવેશ જુઓ. પરિવારનું સભ્યપદ બીજા પુખ્ત વ્યક્તિ પર અમર્યાદિત અધિકાર આપતું નથી.",
        )}
      />
      <Notice>
        <ShieldCheck size={17} />{" "}
        {t(
          "This account may act only within the server-authorized family and task scope. Additional representation must be reviewed by an authorized officer; it is not granted by ticking a checkbox.",
          "આ ખાતું માત્ર સર્વરથી અધિકૃત પરિવાર અને કાર્યની મર્યાદામાં કાર્ય કરી શકે છે. વધારાની પ્રતિનિધિત્વ અધિકૃત અધિકારી દ્વારા ચકાસવી જરૂરી છે.",
        )}
      </Notice>
      <div className="panel">
        {result.loading ? (
          <Loading />
        ) : result.error ? (
          <ErrorBox error={result.error} />
        ) : result.data?.items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("Action / purpose", "કાર્ય / હેતુ")}</th>
                  <th>{t("Authority", "સત્તા")}</th>
                  <th>{t("Time", "સમય")}</th>
                </tr>
              </thead>
              <tbody>
                {result.data.items.map((a, i) => (
                  <tr key={i}>
                    <td>
                      {String(a.action || a.purpose || "Recorded access")}
                    </td>
                    <td>
                      {String(
                        a.actor_role || a.department || "Registry service",
                      )}
                    </td>
                    <td>
                      {formatDate(String(a.created_at || a.timestamp || ""))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={t(
              "No accessible history entries",
              "પ્રવેશ ઇતિહાસની નોંધ નથી",
            )}
          />
        )}
      </div>
      <Link className="button outline" to="/grievances">
        {t("Raise a privacy concern", "ગોપનીયતા અંગે ફરિયાદ")}
      </Link>
    </div>
  );
}

export function ChangeRequest() {
  const { id } = useParams();
  const { t } = useApp();
  const nav = useNavigate();
  const family = useResource(() => api<Family>("/families/mine"));
  const existing = useResource(
    () =>
      id ? api<Application>("/applications/" + id) : Promise.resolve(null),
    [id],
  );
  const [type, setType] = useState("address");
  const [name, setName] = useState("");
  const [nameGu, setNameGu] = useState("");
  const [person, setPerson] = useState("");
  const [dob, setDob] = useState("");
  const [rel, setRel] = useState("child");
  const [date, setDate] = useState("");
  const [address, setAddress] = useState<Address>({
    address_line: "",
    locality: "",
    taluka: "",
    district: "Ahmedabad",
    pincode: "",
  });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<Application | null>(null);
  useEffect(() => {
    const app = existing.data;
    if (!app) return;
    setCreated(app);
    setType(app.kind);
    const p = app.payload;
    if (p.address) setAddress(p.address as Address);
    setPerson(String(p.person_id || ""));
    setName(String(p.name || ""));
    setNameGu(String(p.name_gu || ""));
    setDate(String(p.effective_date || ""));
    if (p.member) {
      const m = p.member as {
        name: string;
        name_gu?: string;
        dob: string;
        relationship: string;
      };
      setName(m.name);
      setNameGu(m.name_gu || "");
      setDob(m.dob);
      setRel(m.relationship);
    }
  }, [existing.data]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload =
        type === "address"
          ? { address }
          : type === "name"
            ? { person_id: person, name, name_gu: nameGu }
            : type === "add_member"
              ? { member: { name, name_gu: nameGu, dob, relationship: rel } }
              : type === "death"
                ? { person_id: person, effective_date: date }
                : { person_id: person };
      const draft = created
        ? await send<Application>(
            "/applications/" + created.id,
            { revision: created.revision, payload, step: 5 },
            "PATCH",
          )
        : await send<Application>("/changes", {
            family_id: family.data!.id,
            change_type: type,
            payload,
          });
      setCreated(draft);
      const sent = await send<Application>(
        "/applications/" + draft.id + "/submit",
        { revision: draft.revision },
        "POST",
        "change-" + draft.id + "-" + draft.revision,
      );
      nav("/my/applications/" + sent.id);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container page">
      <BackLink />
      <PageHeading
        title={t("Request a change", "સુધારાની વિનંતી કરો")}
        description={t(
          "Tell us what has changed. Current verified information remains unchanged until approval and implementation.",
          "શું બદલાયું છે તે જણાવો. મંજૂરી અને અમલ સુધી વર્તમાન ચકાસાયેલ માહિતી બદલાશે નહીં.",
        )}
      />
      {family.loading || existing.loading ? (
        <Loading />
      ) : existing.error ? (
        <ErrorBox error={existing.error} />
      ) : existing.data &&
        !["draft", "needs_information"].includes(existing.data.status) ? (
        <Notice>
          {t(
            "This request is no longer editable. View its recorded status.",
            "આ વિનંતી હવે સુધારી શકાતી નથી. તેની નોંધાયેલ સ્થિતિ જુઓ.",
          )}{" "}
          <Link to={"/my/applications/" + id}>
            {t("View request", "વિનંતી જુઓ")}
          </Link>
        </Notice>
      ) : family.error ? (
        <Notice>
          {t(
            "An approved family record is needed for a change request. Complete registration or get help with a missing family link.",
            "સુધારાની વિનંતી માટે મંજૂર પરિવાર નોંધ જરૂરી છે. નોંધણી પૂર્ણ કરો અથવા પરિવાર જોડાણ માટે મદદ મેળવો.",
          )}{" "}
          <Link to="/my/applications">
            {t("View applications", "અરજીઓ જુઓ")}
          </Link>
        </Notice>
      ) : (
        <form className="panel readable" onSubmit={(e) => void submit(e)}>
          <Field
            label={t("What would you like to change?", "શું સુધારવું છે?")}
          >
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setConfirmed(false);
                setCreated(null);
              }}
              disabled={!!created}
            >
              <option value="address">
                {t("Family residence address", "પરિવારનું રહેઠાણ")}
              </option>
              <option value="name">
                {t("Correct a member name", "સભ્યનું નામ સુધારો")}
              </option>
              <option value="add_member">
                {t("Add a family member", "પરિવારમાં સભ્ય ઉમેરો")}
              </option>
              <option value="death">
                {t("Report a death", "મૃત્યુની જાણ કરો")}
              </option>
              <option value="representative">
                {t("Change family representative", "પરિવારના પ્રતિનિધિ બદલો")}
              </option>
            </select>
          </Field>
          {type === "address" ? (
            <AddressFields address={address} setAddress={setAddress} />
          ) : (
            <>
              {type !== "add_member" && (
                <Field label={t("Affected member", "સંબંધિત સભ્ય")} required>
                  <select
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
                    required
                  >
                    <option value="">
                      {t("Select a member", "સભ્ય પસંદ કરો")}
                    </option>
                    {family.data?.members.map((m) => (
                      <option value={m.id} key={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              {["name", "add_member"].includes(type) && (
                <div className="form-grid">
                  <Field label={t("Name", "નામ")} required>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Field>
                  <Field
                    label={t(
                      "Name in Gujarati (optional)",
                      "ગુજરાતીમાં નામ (વૈકલ્પિક)",
                    )}
                  >
                    <input
                      value={nameGu}
                      onChange={(e) => setNameGu(e.target.value)}
                    />
                  </Field>
                </div>
              )}
              {type === "add_member" && (
                <div className="form-grid">
                  <Field label={t("Date of birth", "જન્મ તારીખ")} required>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      max={new Date().toISOString().slice(0, 10)}
                      required
                    />
                  </Field>
                  <Field label={t("Relationship", "સંબંધ")}>
                    <select
                      value={rel}
                      onChange={(e) => setRel(e.target.value)}
                    >
                      <option value="child">{t("Child", "બાળક")}</option>
                      <option value="grandchild">
                        {t("Grandchild", "પૌત્ર / પૌત્રી")}
                      </option>
                    </select>
                  </Field>
                </div>
              )}
              {type === "death" && (
                <Field label={t("Effective date", "પ્રભાવ તારીખ")} required>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    required
                  />
                </Field>
              )}
            </>
          )}
          <Notice>
            {t(
              "This creates a reviewed request. It does not directly change a source certificate or stop a scheme payment. Transfers, splits and merges need a protected case with the affected parties; raise a grievance for assistance.",
              "આ ચકાસણીપાત્ર વિનંતી બનાવે છે. તે સ્ત્રોત પ્રમાણપત્ર બદલે કે યોજનાની ચુકવણી બંધ કરતું નથી. સ્થળાંતર, વિભાજન અને વિલીનીકરણ માટે સંબંધિત પક્ષો સાથે સુરક્ષિત કેસ જરૂરી છે; મદદ માટે ફરિયાદ કરો.",
            )}
          </Notice>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              required
            />
            {t(
              "I confirm these details and my authority to request this change.",
              "હું આ વિગતો અને સુધારો માંગવાના મારા અધિકારની પુષ્ટિ કરું છું.",
            )}
          </label>
          {Boolean(error) && <ErrorBox error={error} />}
          <FormActions>
            <button className="button" disabled={busy || !confirmed}>
              {busy
                ? t("Submitting…", "મોકલી રહ્યું છે…")
                : t("Submit change request", "સુધારાની વિનંતી મોકલો")}
              <ArrowRight size={16} />
            </button>
            <Link to="/my/family" className="button outline">
              {t("Cancel", "રદ કરો")}
            </Link>
          </FormActions>
        </form>
      )}
    </div>
  );
}
export function AddressFields({
  address,
  setAddress,
  districts,
}: {
  address: Address;
  setAddress: (a: Address) => void;
  districts?: string[];
}) {
  const { t } = useApp();
  return (
    <div className="form-grid">
      {(
        [
          ["address_line", "Address line", "સરનામું"],
          ["locality", "Village / ward / locality", "ગામ / વોર્ડ / વિસ્તાર"],
          ["taluka", "Taluka / urban body", "તાલુકો / શહેરી સંસ્થા"],
        ] as const
      ).map(([key, en, gu]) => (
        <Field key={key} label={t(en, gu)} required>
          <input
            value={address[key]}
            onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
            required
            maxLength={200}
          />
        </Field>
      ))}
      <Field label={t("District", "જિલ્લો")} required>
        {districts?.length ? (
          <select
            value={address.district}
            onChange={(e) =>
              setAddress({ ...address, district: e.target.value })
            }
          >
            {districts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        ) : (
          <input
            value={address.district}
            onChange={(e) =>
              setAddress({ ...address, district: e.target.value })
            }
            required
          />
        )}
      </Field>
      <Field label={t("PIN code", "પિન કોડ")} required>
        <input
          inputMode="numeric"
          value={address.pincode}
          onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
          pattern="[0-9]{6}"
          maxLength={6}
          required
        />
      </Field>
      <Field label={t("State", "રાજ્ય")}>
        <input value={t("Gujarat", "ગુજરાત")} disabled />
      </Field>
    </div>
  );
}
