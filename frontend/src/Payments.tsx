import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  IndianRupee,
  Printer,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import { api, send } from "./api";
import type { List } from "./api";
import { useApp } from "./context";
import {
  BackLink,
  Breadcrumb,
  Empty,
  ErrorBox,
  Field,
  Loading,
  Notice,
  PageHeading,
  Status,
  formatDate,
  useResource,
} from "./ui";
import "./payments.css";

type PaymentEvent = {
  id: string;
  action: string;
  from_status: string | null;
  to_status: string;
  reason: string;
  created_at: string;
};
type Payment = {
  id: string;
  reference: string;
  scheme_application_id: string;
  scheme_name: string;
  department: string;
  person_name: string;
  amount: string;
  currency: string;
  period: string;
  status: string;
  revision: number;
  provider: string;
  provider_reference: string | null;
  created_at: string;
  updated_at: string;
  events: PaymentEvent[];
};
type Referral = {
  id: string;
  reference: string;
  scheme_name: string;
  person_name: string;
  status: string;
  created_at: string;
  payment_id: string | null;
};

function PaymentStatus({ value }: { value: string }) {
  const { t } = useApp();
  const titles: Record<string, [string, string]> = {
    sanctioned: ["Sanctioned — payment pending", "મંજૂર — ચુકવણી બાકી"],
    processing: ["Payment processing", "ચુકવણી પ્રક્રિયામાં"],
    paid: ["Paid as reported", "ચુકવણી નોંધાયેલ"],
    failed: ["Payment failed", "ચુકવણી નિષ્ફળ"],
    reversed: ["Payment reversed", "ચુકવણી પરત થયેલ"],
    referred: ["Awaiting department review", "વિભાગની ચકાસણી બાકી"],
  };
  const labels = titles[value];
  return labels ? (
    <span className={"status status-" + value}>{t(...labels)}</span>
  ) : (
    <Status value={value} />
  );
}

function Transaction({ payment }: { payment: Payment }) {
  const { t, locale } = useApp();
  const money = (value: string) =>
    new Intl.NumberFormat(locale === "gu" ? "gu-IN" : "en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Number(value));
  return (
    <section
      className="panel transaction"
      aria-label={t("Transaction details", "વ્યવહારની વિગતો")}
    >
      <div className="payment-title">
        <div>
          <span className="eyebrow">
            {t("Payment record", "ચુકવણીની નોંધ")}
          </span>
          <h2>{payment.scheme_name}</h2>
          <p>
            {payment.person_name} · {payment.department}
          </p>
        </div>
        <div className="payment-total">
          {money(payment.amount)}
          <PaymentStatus value={payment.status} />
        </div>
      </div>
      <dl className="payment-facts">
        <div>
          <dt>{t("Transaction reference", "વ્યવહાર નંબર")}</dt>
          <dd>{payment.reference}</dd>
        </div>
        <div>
          <dt>{t("Benefit period", "લાભનો સમયગાળો")}</dt>
          <dd>{payment.period}</dd>
        </div>
        <div>
          <dt>{t("Provider reference", "પ્રદાતા નંબર")}</dt>
          <dd>
            {payment.provider_reference || t("Not issued yet", "હજુ જારી નથી")}
          </dd>
        </div>
        <div>
          <dt>{t("Last reported", "છેલ્લી નોંધ")}</dt>
          <dd>{formatDate(payment.updated_at)}</dd>
        </div>
      </dl>
      <h3>{t("Transaction history", "વ્યવહારનો ઇતિહાસ")}</h3>
      <ol className="payment-timeline">
        {payment.events.map((event) => (
          <li key={event.id}>
            <span className="timeline-dot" />
            <div>
              <PaymentStatus value={event.to_status} />
              <p>{event.reason}</p>
              <small>{formatDate(event.created_at)}</small>
            </div>
          </li>
        ))}
      </ol>
      <div className="payment-actions">
        <button className="button outline small" onClick={() => window.print()}>
          <Printer size={16} />
          {t("Print transaction", "વ્યવહાર છાપો")}
        </button>
        <Link
          className="text-link"
          to={
            "/grievances?category=benefit&reference=" +
            encodeURIComponent(payment.reference)
          }
        >
          {t("Report a payment issue", "ચુકવણીની સમસ્યા જણાવો")}
          <ArrowRight size={16} />
        </Link>
      </div>
      {payment.provider === "simulated" && (
        <p className="payment-simulation">
          <FileText size={15} />
          {t(
            "Test-environment record. The payment provider is simulated; no money has moved.",
            "પરીક્ષણની નોંધ. ચુકવણી પ્રદાતા અનુકરણ છે; કોઈ નાણાં ટ્રાન્સફર થયાં નથી.",
          )}
        </p>
      )}
    </section>
  );
}

export function Payments() {
  const { t } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const result = useResource(
    () => api<List<Payment>>("/payments?page=" + page),
    [page],
  );
  const chosen = result.data?.items.find((p) => p.id === selected);
  return (
    <div className="container page">
      <Breadcrumb label={t("Payments", "ચુકવણીઓ")} />
      <BackLink />
      <PageHeading
        eyebrow={t("Benefit payment records", "લાભ ચુકવણી નોંધ")}
        title={t("Payments & transactions", "ચુકવણી અને વ્યવહારો")}
        description={t(
          "Follow payments reported for you and the members you are authorised to represent.",
          "તમારા અને તમે અધિકૃત રીતે પ્રતિનિધિત્વ કરતા સભ્યો માટે નોંધાયેલી ચુકવણીઓ જુઓ.",
        )}
      >
        <Link to="/my/benefits" className="button outline">
          <WalletCards size={18} />
          {t("Benefit passbook", "લાભની પાસબુક")}
        </Link>
      </PageHeading>
      <Notice>
        {t(
          "An approved application is not proof of payment. A missing transaction may mean the department has not reported it yet.",
          "મંજૂર અરજી ચુકવણીનો પુરાવો નથી. વ્યવહાર ન દેખાય તો વિભાગે તેની નોંધ હજી મોકલી ન હોય શકે.",
        )}
      </Notice>
      {result.loading ? (
        <Loading />
      ) : result.error ? (
        <ErrorBox error={result.error} retry={result.reload} />
      ) : result.data?.items.length ? (
        <>
          <div className="payment-list">
            {result.data.items.map((item) => (
              <button
                key={item.id}
                className={
                  "payment-row " + (selected === item.id ? "selected" : "")
                }
                onClick={() => setSelected(item.id)}
                aria-expanded={selected === item.id}
              >
                <span className="payment-icon">
                  <IndianRupee size={22} />
                </span>
                <span>
                  <strong>{item.scheme_name}</strong>
                  <small>
                    {item.reference} · {item.period}
                  </small>
                </span>
                <PaymentStatus value={item.status} />
                <ArrowRight size={18} />
              </button>
            ))}
          </div>
          {chosen && <Transaction payment={chosen} />}
          <div className="payment-pagination">
            <button
              className="button outline small"
              disabled={page === 1}
              onClick={() => {
                setPage((p) => p - 1);
                setSelected(null);
              }}
            >
              {t("Previous", "પાછળ")}
            </button>
            <span>
              {t("Page", "પૃષ્ઠ")} {page}
            </span>
            <button
              className="button outline small"
              disabled={page * result.data.page_size >= result.data.total}
              onClick={() => {
                setPage((p) => p + 1);
                setSelected(null);
              }}
            >
              {t("Next", "આગળ")}
            </button>
          </div>
        </>
      ) : (
        <Empty title={t("No payment reports yet", "હજુ ચુકવણીની નોંધ નથી")}>
          <p>
            {t(
              "Payments will appear after a participating department reports them. You can still track your scheme applications.",
              "સંબંધિત વિભાગ નોંધ મોકલશે ત્યારે ચુકવણીઓ અહીં દેખાશે. યોજનાની અરજીની સ્થિતિ જોઈ શકો છો.",
            )}
          </p>
          <Link to="/schemes" className="text-link">
            {t("Explore schemes", "યોજનાઓ જુઓ")}
            <ArrowRight size={16} />
          </Link>
        </Empty>
      )}
    </div>
  );
}

export function StaffPayments() {
  const { t } = useApp();
  const [tab, setTab] = useState<"applications" | "payments">("applications");
  const [selected, setSelected] = useState<Payment | null>(null);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("");
  const [outcome, setOutcome] = useState("paid");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState("");
  const intents = useRef(new Map<string, string>());
  const apps = useResource(
    () => api<List<Referral>>("/staff/scheme-applications"),
    [],
  );
  const payments = useResource(() => api<List<Payment>>("/staff/payments"), []);
  const [review, setReview] = useState<Referral | null>(null);
  async function act(path: string, payload: unknown) {
    setBusy(true);
    setError(null);
    setSuccess("");
    const intent = path + JSON.stringify(payload);
    const key = intents.current.get(intent) || crypto.randomUUID();
    intents.current.set(intent, key);
    try {
      const response = await send<Payment | { status: string }>(
        path,
        payload,
        "POST",
        key,
      );
      intents.current.delete(intent);
      apps.reload();
      payments.reload();
      setReview(null);
      setReason("");
      if ("reference" in response) setSelected(response as Payment);
      setSuccess(
        t(
          "The action was recorded successfully.",
          "કાર્ય સફળતાપૂર્વક નોંધાયું.",
        ),
      );
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container page">
      <Breadcrumb
        label={t("Department payment register", "વિભાગનું ચુકવણી રજિસ્ટર")}
      />
      <PageHeading
        eyebrow={t("Department workspace", "વિભાગ કાર્યસ્થળ")}
        title={t(
          "Scheme decisions & payment register",
          "યોજનાના નિર્ણયો અને ચુકવણી રજિસ્ટર",
        )}
        description={t(
          "Review only your assigned scheme applications. Each sanction and provider outcome is recorded in the audit history.",
          "માત્ર તમારી સોંપાયેલી યોજનાની અરજીઓ ચકાસો. દરેક મંજૂરી અને પ્રદાતાનું પરિણામ ઓડિટ ઇતિહાસમાં નોંધાય છે.",
        )}
      />
      <div
        className="payment-tabs"
        role="tablist"
        aria-label={t("Payment workspace", "ચુકવણી કાર્યસ્થળ")}
      >
        <button
          role="tab"
          aria-selected={tab === "applications"}
          onClick={() => {
            setTab("applications");
            setSelected(null);
          }}
        >
          <FileText size={18} />
          {t("Scheme applications", "યોજનાની અરજીઓ")}
        </button>
        <button
          role="tab"
          aria-selected={tab === "payments"}
          onClick={() => {
            setTab("payments");
            setReview(null);
          }}
        >
          <IndianRupee size={18} />
          {t("Payment register", "ચુકવણી રજિસ્ટર")}
        </button>
      </div>
      {error ? <ErrorBox error={error} /> : null}
      {success && <Notice type="success">{success}</Notice>}
      {tab === "applications" ? (
        <>
          {apps.loading ? (
            <Loading />
          ) : apps.error ? (
            <ErrorBox error={apps.error} retry={apps.reload} />
          ) : !apps.data?.items.length ? (
            <Empty
              title={t(
                "No assigned scheme applications",
                "સોંપાયેલી યોજનાની અરજી નથી",
              )}
            >
              <p>
                {t(
                  "Connected applications in your approved scheme and district scope will appear here.",
                  "તમારી મંજૂર યોજના અને જિલ્લાની અરજીઓ અહીં દેખાશે.",
                )}
              </p>
            </Empty>
          ) : (
            <div className="payment-list">
              {apps.data.items.map((item) => (
                <div className="payment-row" key={item.id}>
                  <span className="payment-icon">
                    <FileText size={22} />
                  </span>
                  <span>
                    <strong>{item.person_name}</strong>
                    <small>
                      {item.scheme_name} · {item.reference}
                    </small>
                  </span>
                  <PaymentStatus value={item.status} />
                  {["referred", "under_review"].includes(item.status) && (
                    <button
                      className="button outline small"
                      onClick={() => {
                        setReview(item);
                        setReason("");
                        setAmount("");
                        setPeriod("");
                      }}
                    >
                      {t("Review", "ચકાસો")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {review && (
            <form
              className="panel payment-decision"
              onSubmit={(e) => {
                e.preventDefault();
                void act(
                  "/staff/scheme-applications/" + review.id + "/decision",
                  { action: "sanction", amount, period, reason },
                );
              }}
            >
              <h2>
                {t("Review application", "અરજી ચકાસો")}: {review.reference}
              </h2>
              <p>
                {review.person_name} · {review.scheme_name}
              </p>
              <Notice type="warning">
                {t(
                  "Confirm scheme-specific eligibility and authority before sanctioning. Family membership alone is not eligibility. This test environment records simulated decisions only.",
                  "મંજૂરી પહેલાં યોજનાની પાત્રતા અને અધિકારની ખાતરી કરો. પરિવાર સભ્યપદ માત્ર પાત્રતા નથી. આ પરીક્ષણમાં અનુકરણ નિર્ણયો નોંધાય છે.",
                )}
              </Notice>
              <div className="payment-form-grid">
                <Field
                  label={t("Sanction amount (INR)", "મંજૂર રકમ (રૂપિયા)")}
                  required
                >
                  <input
                    type="number"
                    min="0.01"
                    max="10000000"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </Field>
                <Field label={t("Benefit period", "લાભનો સમયગાળો")} required>
                  <input
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder={t(
                      "For example: September 2026",
                      "ઉદાહરણ: સપ્ટેમ્બર ૨૦૨૬",
                    )}
                    minLength={4}
                    maxLength={50}
                    required
                  />
                </Field>
              </div>
              <Field label={t("Decision reason", "નિર્ણયનું કારણ")} required>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  minLength={5}
                  maxLength={1000}
                  required
                />
              </Field>
              <div className="payment-actions">
                <button className="button" disabled={busy}>
                  <CheckCircle2 size={17} />
                  {busy
                    ? t("Recording…", "નોંધાઈ રહ્યું છે…")
                    : t("Record sanction", "મંજૂરી નોંધો")}
                </button>
                <button
                  type="button"
                  className="button outline"
                  disabled={busy || reason.trim().length < 5}
                  onClick={() =>
                    void act(
                      "/staff/scheme-applications/" + review.id + "/decision",
                      { action: "reject", reason },
                    )
                  }
                >
                  {t("Reject with reason", "કારણ સાથે નામંજૂર કરો")}
                </button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setReview(null)}
                >
                  {t("Cancel", "રદ કરો")}
                </button>
              </div>
            </form>
          )}
        </>
      ) : (
        <>
          {payments.loading ? (
            <Loading />
          ) : payments.error ? (
            <ErrorBox error={payments.error} retry={payments.reload} />
          ) : !payments.data?.items.length ? (
            <Empty title={t("No payment orders", "ચુકવણીનો આદેશ નથી")} />
          ) : (
            <div className="payment-list">
              {payments.data.items.map((item) => (
                <button
                  className="payment-row"
                  key={item.id}
                  onClick={() => {
                    setSelected(item);
                    setReason("");
                  }}
                >
                  <span className="payment-icon">
                    <Clock3 size={22} />
                  </span>
                  <span>
                    <strong>
                      {item.person_name} · ₹{item.amount}
                    </strong>
                    <small>
                      {item.reference} · {item.scheme_name}
                    </small>
                  </span>
                  <PaymentStatus value={item.status} />
                  <ArrowRight size={18} />
                </button>
              ))}
            </div>
          )}
          {selected && (
            <>
              <Transaction payment={selected} />
              {["sanctioned", "failed", "paid"].includes(selected.status) && (
                <form
                  className="panel payment-decision"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (selected.status === "paid")
                      void act("/staff/payments/" + selected.id + "/reverse", {
                        revision: selected.revision,
                        reason,
                      });
                    else
                      void act("/staff/payments/" + selected.id + "/process", {
                        revision: selected.revision,
                        outcome,
                        reason:
                          reason ||
                          "Payment instruction processed by configured provider",
                      });
                  }}
                >
                  <h2>
                    {selected.status === "paid"
                      ? t("Record a reversal", "પરત ચુકવણી નોંધો")
                      : t(
                          "Process payment instruction",
                          "ચુકવણી આદેશની પ્રક્રિયા",
                        )}
                  </h2>
                  <Field
                    label={t("Processing reason", "પ્રક્રિયાનું કારણ")}
                    required={selected.status === "paid"}
                  >
                    <textarea
                      minLength={selected.status === "paid" ? 5 : undefined}
                      maxLength={1000}
                      required={selected.status === "paid"}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </Field>
                  {selected.provider === "simulated" &&
                    selected.status !== "paid" && (
                      <details className="payment-test-tools">
                        <summary>
                          {t(
                            "Test-provider controls",
                            "પરીક્ષણ પ્રદાતાના નિયંત્રણો",
                          )}
                        </summary>
                        <Field
                          label={t(
                            "Simulated provider response",
                            "અનુકરણ પ્રદાતાનો પ્રતિસાદ",
                          )}
                        >
                          <select
                            value={outcome}
                            onChange={(e) => setOutcome(e.target.value)}
                          >
                            <option value="paid">
                              {t("Payment completed", "ચુકવણી પૂર્ણ")}
                            </option>
                            <option value="failed">
                              {t("Payment failed", "ચુકવણી નિષ્ફળ")}
                            </option>
                          </select>
                        </Field>
                      </details>
                    )}
                  <button className="button" disabled={busy}>
                    <RefreshCw size={17} />
                    {busy
                      ? t("Processing…", "પ્રક્રિયા ચાલુ…")
                      : selected.status === "paid"
                        ? t("Confirm reversal", "પરત ચુકવણીની ખાતરી કરો")
                        : t("Process payment", "ચુકવણી પ્રક્રિયા કરો")}
                  </button>
                </form>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
