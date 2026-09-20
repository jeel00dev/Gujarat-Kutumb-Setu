import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  FileCheck2,
  LoaderCircle,
} from "lucide-react";
import { useApp } from "./context";
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function Breadcrumb({ label }: { label: string }) {
  const { t } = useApp();
  return (
    <nav className="breadcrumb" aria-label={t("Breadcrumb", "પૃષ્ઠ પથ")}>
      <Link to="/">{t("Home", "મુખ્ય પૃષ્ઠ")}</Link>
      <ChevronRight size={14} />
      <span>{label}</span>
    </nav>
  );
}
export function Notice({
  children,
  type = "info",
}: {
  children: ReactNode;
  type?: "info" | "warning" | "success" | "error";
}) {
  return (
    <div
      className={`notice ${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <AlertCircle size={20} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
export function Loading() {
  const { t } = useApp();
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={24} />
      {t("Loading, please wait…", "માહિતી આવી રહી છે…")}
    </div>
  );
}
export function ErrorBox({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  const { t } = useApp();
  return (
    <Notice type="error">
      <strong>
        {t("We could not complete this request.", "આ વિનંતી પૂર્ણ થઈ શકી નથી.")}
      </strong>
      <p>{error instanceof Error ? error.message : String(error)}</p>
      {retry && (
        <button className="button small outline" onClick={retry}>
          {t("Try again", "ફરી પ્રયાસ કરો")}
        </button>
      )}
    </Notice>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <FileCheck2 size={36} strokeWidth={1.3} />
      <h3>{title}</h3>
      {children}
    </div>
  );
}
const statuses: Record<string, [string, string]> = {
  draft: ["Draft — not submitted", "ડ્રાફ્ટ — મોકલેલી નથી"],
  submitted: ["Submitted", "મોકલેલી"],
  under_review: ["Under verification", "ચકાસણી હેઠળ"],
  under_verification: ["Under verification", "ચકાસણી હેઠળ"],
  verified: ["Verified", "ચકાસાયેલ"],
  needs_information: ["More information needed", "વધુ માહિતી જરૂરી"],
  approved: ["Approved", "મંજૂર"],
  rejected: ["Not approved", "મંજૂર નથી"],
  implemented: ["Implemented", "અમલમાં"],
  active: ["Active", "સક્રિય"],
  open: ["Received", "પ્રાપ્ત"],
  resolved: ["Resolved", "નિરાકરણ"],
  closed: ["Closed", "બંધ"],
  received: ["Received", "પ્રાપ્ત"],
  paid: ["Paid as reported", "ચુકવણી નોંધાયેલ"],
  paid_as_reported: ["Paid as reported", "ચુકવણી નોંધાયેલ"],
  reported_paid: ["Paid as reported", "ચુકવણી નોંધાયેલ"],
  reversed: ["Reversed", "પરત થયેલ"],
  in_kind_issued: ["In-kind issued", "વસ્તુ સહાય આપેલી"],
  information_only: ["Information only", "માત્ર માહિતી"],
  sandbox: ["Synthetic sandbox", "કૃત્રિમ પરીક્ષણ"],
  pending: ["Pending", "બાકી"],
  requested: ["Requested", "વિનંતી કરેલ"],
  awaiting_approval: ["Awaiting approval", "મંજૂરી બાકી"],
};
export function Status({ value }: { value: string }) {
  const { t } = useApp();
  const labels = statuses[value] || [
    value.replaceAll("_", " "),
    value.replaceAll("_", " "),
  ];
  return (
    <span className={`status status-${value}`}>{t(labels[0], labels[1])}</span>
  );
}
export function Field({
  label,
  children,
  help,
  required,
}: {
  label: string;
  children: ReactNode;
  help?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <span className="required"> *</span>}
      </span>
      {children}
      {help && <small>{help}</small>}
    </label>
  );
}
export function FormActions({ children }: { children: ReactNode }) {
  return <div className="form-actions">{children}</div>;
}
export function BackLink({
  to = "/my",
  label,
}: {
  to?: string;
  label?: string;
}) {
  const { t } = useApp();
  return (
    <Link className="text-link back-link" to={to}>
      <ArrowLeft size={16} />
      {label || t("Back to my dashboard", "મારા ડેશબોર્ડ પર પાછા")}
    </Link>
  );
}
export function useResource<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    loader()
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError(e);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [...deps, revision]);
  return {
    data,
    error,
    loading,
    reload: () => setRevision((n) => n + 1),
    setData,
  };
}
export function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeZone: "Asia/Kolkata",
      }).format(d);
}
export function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}) {
  const { t } = useApp();
  if (total <= pageSize) return null;
  return (
    <nav
      className="form-actions no-print"
      aria-label={t("Results pagination", "પરિણામ પૃષ્ઠો")}
    >
      <button
        className="button outline small"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {t("Previous", "પાછલું")}
      </button>
      <span>
        {t("Page", "પૃષ્ઠ")} {page} / {Math.ceil(total / pageSize)}
      </span>
      <button
        className="button outline small"
        disabled={page * pageSize >= total}
        onClick={() => onChange(page + 1)}
      >
        {t("Next", "આગળ")}
      </button>
    </nav>
  );
}
export function DetailList({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="detail-list">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
