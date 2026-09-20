import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { api, send } from "./api";
import type { Address, Application, List } from "./api";
import { useApp } from "./context";
import {
  BackLink,
  Breadcrumb,
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
import { AddressFields, PayloadSummary } from "./ResidentPages";
interface EnrollmentPayload {
  applicant: { name: string; name_gu: string; phone: string };
  address: Address;
  members: {
    client_id: string;
    name: string;
    name_gu: string;
    dob: string;
    relationship: string;
  }[];
  declarations: { accuracy: boolean; authority: boolean };
}
const freshPayload = (name = ""): EnrollmentPayload => ({
  applicant: { name, name_gu: "", phone: "" },
  address: {
    address_line: "",
    locality: "",
    taluka: "",
    district: "Ahmedabad",
    pincode: "",
  },
  members: [
    {
      client_id: crypto.randomUUID(),
      name,
      name_gu: "",
      dob: "",
      relationship: "self",
    },
  ],
  declarations: { accuracy: false, authority: false },
});
export function ApplyStart() {
  const { t, user } = useApp();
  const nav = useNavigate();
  const [branch, setBranch] = useState("no_ration");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [authority, setAuthority] = useState("");
  const start = async () => {
    if (!user) {
      nav("/sign-in", { state: { from: "/apply/start" } });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const draft = await send<Application>("/applications", {
        kind: "enrollment",
        branch,
        district:
          user.role === "operator" ? user.district || "Ahmedabad" : "Ahmedabad",
        payload: freshPayload(
          user.role === "operator" ? "" : user.display_name,
        ),
        step: 1,
        ...(user.role === "operator"
          ? { owner_email: ownerEmail, assisted_authority: authority }
          : {}),
      });
      nav("/apply/" + draft.id);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container page">
      <Breadcrumb label={t("New family application", "નવા પરિવારની અરજી")} />
      <PageHeading
        eyebrow={t("Before you apply", "અરજી કરતા પહેલાં")}
        title={t("Register your family", "તમારા પરિવારની નોંધણી કરો")}
        description={t(
          "A clear application, a secure draft and a visible review process.",
          "સ્પષ્ટ અરજી, સુરક્ષિત ડ્રાફ્ટ અને દેખાતી ચકાસણી પ્રક્રિયા.",
        )}
      />
      <div className="content-with-aside">
        <div>
          <section className="panel">
            {user?.role === "operator" && (
              <section className="panel">
                <h2>
                  {t(
                    "Begin an authorized resident session",
                    "અધિકૃત રહેવાસી સત્ર શરૂ કરો",
                  )}
                </h2>
                <Notice>
                  {t(
                    "Confirm the resident's identity and task authority through the approved assisted process. Do not use the resident's OTP as your staff identity.",
                    "મંજૂર સહાયિત પ્રક્રિયાથી રહેવાસીની ઓળખ અને કાર્ય અધિકારની પુષ્ટિ કરો. કર્મચારી ઓળખ તરીકે રહેવાસીનો OTP વાપરશો નહીં.",
                  )}
                </Notice>
                <Field
                  label={t("Resident account email", "રહેવાસી ખાતાનો ઇમેઇલ")}
                  required
                  help={t(
                    "Use the pre-established resident account assigned for this assisted case.",
                    "આ સહાયિત કેસ માટે ફાળવેલું પૂર્વસ્થાપિત રહેવાસી ખાતું વાપરો.",
                  )}
                >
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    required
                  />
                </Field>
                <Field
                  label={t(
                    "Recorded authority and resident acknowledgement",
                    "નોંધાયેલ અધિકાર અને રહેવાસીની સ્વીકૃતિ",
                  )}
                  required
                >
                  <textarea
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    minLength={10}
                    maxLength={500}
                    required
                  />
                </Field>
              </section>
            )}
            <h2>
              {t("Do you have a ration card?", "તમારી પાસે રેશન કાર્ડ છે?")}
            </h2>
            <div className="choice-cards">
              {[
                [
                  "ration",
                  "Yes, I have a card",
                  "હા, મારી પાસે કાર્ડ છે",
                  "Check existing links first.",
                  "પહેલાં હાલની કડી તપાસો.",
                ],
                [
                  "no_ration",
                  "No ration card",
                  "રેશન કાર્ડ નથી",
                  "Use independent registration.",
                  "સ્વતંત્ર નોંધણી વાપરો.",
                ],
                [
                  "unsure",
                  "I am not sure",
                  "મને ખાતરી નથી",
                  "Continue with a review route.",
                  "ચકાસણીના વિકલ્પ સાથે આગળ વધો.",
                ],
              ].map(([value, en, gu, d, dg]) => (
                <label key={value} className="choice-card">
                  <input
                    type="radio"
                    name="branch"
                    checked={branch === value}
                    value={value}
                    onChange={() => setBranch(value)}
                  />
                  <span>
                    <strong>{t(en, gu)}</strong>
                    <small>{t(d, dg)}</small>
                  </span>
                </label>
              ))}
            </div>
            {branch === "ration" && (
              <Notice>
                {t(
                  "Check whether your family is already linked before creating a new application. PDS verification uses a simulated source in this test environment.",
                  "નવી અરજી બનાવતા પહેલાં તમારો પરિવાર પહેલેથી જોડાયેલ છે કે નહીં તે તપાસો. આ પરીક્ષણ વાતાવરણમાં PDS ચકાસણી અનુરૂપ સ્ત્રોતથી થાય છે.",
                )}{" "}
                <Link to="/find-id">
                  {t("Check my existing record", "મારી હાલની નોંધ તપાસો")}
                </Link>
              </Notice>
            )}
            <h3>{t("What you will need", "તમારે શું જોઈએ")}</h3>
            <ul className="check-list">
              <li>
                <Check />
                {t(
                  "Applicant contact and authority to apply",
                  "અરજદારનો સંપર્ક અને અરજી કરવાનો અધિકાર",
                )}
              </li>
              <li>
                <Check />
                {t(
                  "Current residence and jurisdiction",
                  "વર્તમાન રહેઠાણ અને કાર્યક્ષેત્ર",
                )}
              </li>
              <li>
                <Check />
                {t(
                  "Member names, dates of birth and relationships",
                  "સભ્યોના નામ, જન્મ તારીખો અને સંબંધો",
                )}
              </li>
            </ul>
            <p>
              {t(
                "No Aadhaar, bank account, caste or property details are required by this test intake policy. Use synthetic details only in this environment.",
                "આ પરીક્ષણ નીતિમાં આધાર, બેંક, જાતિ કે મિલકતની વિગતો જરૂરી નથી. આ વાતાવરણમાં માત્ર કૃત્રિમ વિગતો વાપરો.",
              )}
            </p>
            {Boolean(error) && <ErrorBox error={error} />}
            <FormActions>
              <button
                className="button"
                disabled={
                  busy ||
                  (user?.role === "operator" &&
                    (!ownerEmail.includes("@") || authority.trim().length < 10))
                }
                onClick={() => void start()}
              >
                {busy
                  ? t(
                      "Creating a secure draft…",
                      "સુરક્ષિત ડ્રાફ્ટ બની રહ્યો છે…",
                    )
                  : t("Continue to application", "અરજી પર આગળ વધો")}
                <ArrowRight size={17} />
              </button>
              <Link to="/my/applications" className="text-link">
                {t("Resume a saved draft", "સાચવેલો ડ્રાફ્ટ આગળ ભરો")}
              </Link>
            </FormActions>
          </section>
        </div>
        <aside>
          <div className="panel">
            <ShieldCheck size={26} className="blue" />
            <h2>{t("You stay in control", "નિયંત્રણ તમારી પાસે")}</h2>
            <p>
              {t(
                "Save before leaving. Review every detail before submitting. A permanent Family ID is issued only after approval.",
                "છોડતા પહેલાં સાચવો. મોકલતા પહેલાં દરેક વિગત ચકાસો. મંજૂરી પછી જ કાયમી પરિવાર ઓળખ મળે છે.",
              )}
            </p>
            <hr />
            <small>
              {t(
                "Fee for this environment: none. No money is collected for registration.",
                "આ વાતાવરણ માટે શુલ્ક નથી. નોંધણી માટે નાણાં લેવામાં આવતા નથી.",
              )}
            </small>
          </div>
          <Link to="/help" className="text-link">
            {t("Need help applying?", "અરજી કરવામાં મદદ જોઈએ?")}
            <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
export function Enrollment() {
  const { id } = useParams();
  const { t } = useApp();
  const nav = useNavigate();
  const result = useResource(
    () => api<Application>("/applications/" + id),
    [id],
  );
  const config = useResource(() =>
    api<{ districts?: string[]; policy_version: string }>("/public/config"),
  );
  const [app, setApp] = useState<Application | null>(null);
  const [payload, setPayload] = useState<EnrollmentPayload>(freshPayload());
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [error, setError] = useState<unknown>(null);
  const [savedAt, setSavedAt] = useState("");
  const revision = useRef(0);
  const savingRef = useRef(false);
  const payloadRef = useRef(payload);
  const stepRef = useRef(step);
  const idempotency = useRef(crypto.randomUUID());
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (result.data) {
      setApp(result.data);
      revision.current = result.data.revision;
      setPayload({
        ...freshPayload(),
        ...result.data.payload,
      } as unknown as EnrollmentPayload);
      setStep(Math.min(Math.max(result.data.step || 1, 1), 5));
      setSavedAt(result.data.updated_at);
      setDirty(false);
    }
  }, [result.data]);
  useEffect(() => {
    payloadRef.current = payload;
    stepRef.current = step;
  }, [payload, step]);
  const update = (value: EnrollmentPayload) => {
    setPayload(value);
    setDirty(true);
    setError(null);
  };
  const save = async (nextStep = stepRef.current) => {
    if (!id || !app) return null;
    if (savingRef.current) return null;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    const snapshot = payloadRef.current;
    try {
      const updated = await send<Application>(
        "/applications/" + id,
        {
          revision: revision.current,
          payload: snapshot,
          step: nextStep,
          district: snapshot.address.district,
        },
        "PATCH",
      );
      revision.current = updated.revision;
      setApp(updated);
      setSavedAt(updated.updated_at);
      if (payloadRef.current === snapshot) setDirty(false);
      return updated;
    } catch (e) {
      setSaveError(e);
      throw e;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  useEffect(() => {
    if (
      !dirty ||
      saving ||
      saveError ||
      !app ||
      !["draft", "needs_information"].includes(app.status)
    )
      return;
    const timer = window.setTimeout(() => {
      void save().catch(() => {});
    }, 1400);
    return () => clearTimeout(timer);
  }, [payload, dirty, app?.id, saving, saveError]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingRef.current) return;
    setBusy(true);
    setError(null);
    try {
      if (step === 3 && !payload.members.some((m) => m.relationship === "self"))
        throw new Error(
          t(
            "One member must be the applicant (self).",
            "એક સભ્ય અરજદાર (પોતે) હોવો જરૂરી છે.",
          ),
        );
      const target = Math.min(step + 1, 5);
      const updated = await save(target);
      if (updated) {
        setStep(target);
        window.scrollTo(0, 200);
      }
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  const back = () => {
    setStep((s) => Math.max(1, s - 1));
    setError(null);
  };
  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      if (!payload.declarations.accuracy || !payload.declarations.authority)
        throw new Error(
          t(
            "Please review and confirm both required declarations.",
            "કૃપા કરીને બંને જરૂરી જાહેરાતો ચકાસો અને પુષ્ટિ કરો.",
          ),
        );
      const updated = await save(5);
      if (!updated) return;
      const sent = await send<Application>(
        "/applications/" + id + "/submit",
        { revision: updated.revision },
        "POST",
        idempotency.current,
      );
      setDirty(false);
      nav("/my/applications/" + sent.id + "/receipt");
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
  if (!app) return <Loading />;
  if (!["draft", "needs_information"].includes(app.status))
    return (
      <div className="container page">
        <Notice>
          {t(
            "This application has already been submitted. View its current status instead of changing the submitted record.",
            "આ અરજી પહેલેથી મોકલેલી છે. મોકલેલી નોંધમાં ફેરફાર કરવા બદલે તેની સ્થિતિ જુઓ.",
          )}
        </Notice>
        <Link className="button" to={"/my/applications/" + id}>
          {t("View status", "સ્થિતિ જુઓ")}
        </Link>
      </div>
    );
  const steps = [
    t("Applicant", "અરજદાર"),
    t("Residence", "રહેઠાણ"),
    t("Family members", "પરિવારના સભ્યો"),
    t("Evidence", "પુરાવા"),
    t("Review & submit", "ચકાસો અને મોકલો"),
  ];
  return (
    <div className="container page">
      <BackLink
        to="/my/applications"
        label={t("Back to my applications", "મારી અરજીઓ પર પાછા")}
      />
      <PageHeading
        title={t("Family registration", "પરિવાર નોંધણી")}
        description={t(
          "Complete each step. Your draft is saved securely on this service.",
          "દરેક પગલું પૂર્ણ કરો. તમારો ડ્રાફ્ટ આ સેવામાં સુરક્ષિત રીતે સાચવાય છે.",
        )}
      />
      <div className="wizard-layout">
        <aside className="wizard-sidebar">
          <ol aria-label={t("Application steps", "અરજીના પગલાં")}>
            {steps.map((title, i) => (
              <li
                key={i}
                className={
                  i + 1 === step ? "current" : i + 1 < step ? "complete" : ""
                }
                aria-current={i + 1 === step ? "step" : undefined}
              >
                <span>{i + 1 < step ? <Check size={13} /> : i + 1}</span>
                {title}
              </li>
            ))}
          </ol>
          <div className="save-state" role="status">
            {saving
              ? t("Saving your draft…", "તમારો ડ્રાફ્ટ સાચવાઈ રહ્યો છે…")
              : saveError
                ? t(
                    "Not saved — retry below",
                    "સાચવાયું નથી — નીચે ફરી પ્રયાસ કરો",
                  )
                : dirty
                  ? t("Changes not yet saved", "ફેરફારો હજુ સાચવાયા નથી")
                  : t("Draft saved on server", "ડ્રાફ્ટ સર્વર પર સાચવાયેલ")}
            <br />
            {savedAt && formatDate(savedAt)}
            <br />
            <small>{config.data?.policy_version}</small>
          </div>
        </aside>
        <div className="wizard-main">
          <form ref={formRef} className="panel" onSubmit={(e) => void next(e)}>
            <div className="wizard-title">
              <div>
                <span className="eyebrow">
                  {t(`Step ${step} of 5`, `પગલું ${step} / 5`)}
                </span>
                <h2>{steps[step - 1]}</h2>
              </div>
              <Status value={app.status} />
            </div>
            {Boolean(saveError) && (
              <ErrorBox
                error={saveError}
                retry={() => void save().catch(() => {})}
              />
            )}{" "}
            {Boolean(error) && <ErrorBox error={error} />}
            {step === 1 && (
              <>
                <p>
                  {t(
                    "Tell us who is making this application. Contact details do not establish authority over other adults.",
                    "આ અરજી કોણ કરે છે તે જણાવો. સંપર્ક વિગતો બીજા પુખ્ત વ્યક્તિ પર અધિકાર સ્થાપિત કરતી નથી.",
                  )}
                </p>
                <div className="form-grid">
                  <Field label={t("Applicant name", "અરજદારનું નામ")} required>
                    <input
                      value={payload.applicant.name}
                      onChange={(e) =>
                        update({
                          ...payload,
                          applicant: {
                            ...payload.applicant,
                            name: e.target.value,
                          },
                          members: payload.members.map((member) =>
                            member.relationship === "self"
                              ? { ...member, name: e.target.value }
                              : member,
                          ),
                        })
                      }
                      autoComplete="name"
                      maxLength={150}
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
                      value={payload.applicant.name_gu}
                      onChange={(e) =>
                        update({
                          ...payload,
                          applicant: {
                            ...payload.applicant,
                            name_gu: e.target.value,
                          },
                          members: payload.members.map((member) =>
                            member.relationship === "self"
                              ? { ...member, name_gu: e.target.value }
                              : member,
                          ),
                        })
                      }
                      maxLength={150}
                    />
                  </Field>
                  <Field
                    label={t("Contact mobile", "સંપર્ક મોબાઇલ")}
                    required
                    help={t(
                      "May be shared. This is a contact, not identity proof.",
                      "વહેંચાયેલ હોઈ શકે છે. આ સંપર્ક છે, ઓળખનો પુરાવો નહીં.",
                    )}
                  >
                    <input
                      type="tel"
                      inputMode="tel"
                      value={payload.applicant.phone}
                      onChange={(e) =>
                        update({
                          ...payload,
                          applicant: {
                            ...payload.applicant,
                            phone: e.target.value,
                          },
                        })
                      }
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                    />
                  </Field>
                  <Field label={t("Applying as", "તરીકે અરજી")}>
                    <input
                      value={t(
                        "Self / authorized family applicant",
                        "પોતે / અધિકૃત પરિવાર અરજદાર",
                      )}
                      disabled
                    />
                  </Field>
                </div>
                <Notice>
                  {t(
                    "Use only synthetic contact and member details in this test environment. Additional representation or no-contact recovery requires assisted review.",
                    "આ પરીક્ષણ વાતાવરણમાં માત્ર કૃત્રિમ સંપર્ક અને સભ્યની વિગતો વાપરો. વધારાનું પ્રતિનિધિત્વ અથવા સંપર્ક વિના પુનઃપ્રવેશ માટે સહાયિત ચકાસણી જરૂરી છે.",
                  )}
                </Notice>
                <Link to="/policies/privacy" className="text-link">
                  {t("Read the privacy notice", "ગોપનીયતા સૂચના વાંચો")}
                </Link>
              </>
            )}
            {step === 2 && (
              <>
                <p>
                  {t(
                    "Provide the current family residence. Property ownership and GPS are not required.",
                    "પરિવારના વર્તમાન રહેઠાણની વિગતો આપો. મિલકતની માલિકી અને GPS જરૂરી નથી.",
                  )}
                </p>
                <AddressFields
                  address={payload.address}
                  setAddress={(address) => update({ ...payload, address })}
                  districts={config.data?.districts}
                />
              </>
            )}
            {step === 3 && (
              <>
                <p>
                  {t(
                    "Add each member separately. A single-person family is supported. Keep one applicant relationship marked “Self”.",
                    "દરેક સભ્ય અલગ ઉમેરો. એક વ્યક્તિનો પરિવાર માન્ય છે. એક અરજદારનો સંબંધ “પોતે” રાખો.",
                  )}
                </p>
                {payload.members.map((m, i) => (
                  <div className="member-form" key={m.client_id}>
                    <div className="member-form-header">
                      <h3>
                        {t("Member", "સભ્ય")} {i + 1}
                      </h3>
                      {i > 0 && (
                        <button
                          type="button"
                          className="text-button danger"
                          onClick={() =>
                            update({
                              ...payload,
                              members: payload.members.filter(
                                (x) => x.client_id !== m.client_id,
                              ),
                            })
                          }
                        >
                          <Trash2 size={15} /> {t("Remove", "કાઢો")}
                        </button>
                      )}
                    </div>
                    <div className="form-grid">
                      <Field label={t("Full name", "પૂરું નામ")} required>
                        <input
                          value={m.name}
                          onChange={(e) =>
                            update({
                              ...payload,
                              members: payload.members.map((v, n) =>
                                n === i ? { ...v, name: e.target.value } : v,
                              ),
                            })
                          }
                          maxLength={150}
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
                          value={m.name_gu}
                          onChange={(e) =>
                            update({
                              ...payload,
                              members: payload.members.map((v, n) =>
                                n === i ? { ...v, name_gu: e.target.value } : v,
                              ),
                            })
                          }
                          maxLength={150}
                        />
                      </Field>
                      <Field label={t("Date of birth", "જન્મ તારીખ")} required>
                        <input
                          type="date"
                          value={m.dob}
                          max={new Date().toISOString().slice(0, 10)}
                          min="1900-01-01"
                          onChange={(e) =>
                            update({
                              ...payload,
                              members: payload.members.map((v, n) =>
                                n === i ? { ...v, dob: e.target.value } : v,
                              ),
                            })
                          }
                          required
                        />
                      </Field>
                      <Field
                        label={t(
                          "Relationship to applicant",
                          "અરજદાર સાથે સંબંધ",
                        )}
                        required
                      >
                        <select
                          value={m.relationship}
                          onChange={(e) =>
                            update({
                              ...payload,
                              members: payload.members.map((v, n) =>
                                n === i
                                  ? { ...v, relationship: e.target.value }
                                  : v,
                              ),
                            })
                          }
                        >
                          {[
                            ["self", "Self", "પોતે"],
                            ["spouse", "Spouse", "જીવનસાથી"],
                            ["child", "Child", "બાળક"],
                            ["parent", "Parent", "માતા/પિતા"],
                            ["sibling", "Sibling", "ભાઈ/બહેન"],
                            ["guardian", "Guardian", "વાલી"],
                            ["other", "Other", "અન્ય"],
                          ].map(([v, en, gu]) => (
                            <option key={v} value={v}>
                              {t(en, gu)}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                ))}
                <button
                  className="button outline"
                  type="button"
                  onClick={() =>
                    update({
                      ...payload,
                      members: [
                        ...payload.members,
                        {
                          client_id: crypto.randomUUID(),
                          name: "",
                          name_gu: "",
                          dob: "",
                          relationship: "child",
                        },
                      ],
                    })
                  }
                >
                  <Plus size={17} />
                  {t("Add another member", "બીજો સભ્ય ઉમેરો")}
                </button>
              </>
            )}
            {step === 4 && (
              <>
                <Notice type="success">
                  <strong>
                    {t(
                      "No upload is required for this intake policy.",
                      "આ નોંધણી નીતિ માટે અપલોડ જરૂરી નથી.",
                    )}
                  </strong>
                  <p>
                    {t(
                      "Your declarations will be reviewed. A reviewer may request supporting evidence if needed.",
                      "તમારી જાહેરાતો ચકાસવામાં આવશે. જરૂર પડે તો ચકાસણી અધિકારી પુરાવા માગી શકે છે.",
                    )}
                  </p>
                </Notice>
                <EvidencePanel applicationId={id!} />
              </>
            )}
            {step === 5 && (
              <>
                <Notice>
                  {t(
                    "Review every detail below. Saving a draft is not submission.",
                    "નીચે દરેક વિગત ચકાસો. ડ્રાફ્ટ સાચવવો એ અરજી મોકલવી નથી.",
                  )}
                </Notice>
                <PayloadSummary
                  payload={payload as unknown as Record<string, unknown>}
                />
                <FormActions>
                  <button
                    type="button"
                    className="button outline small"
                    onClick={() => setStep(1)}
                  >
                    {t("Edit applicant", "અરજદાર સુધારો")}
                  </button>
                  <button
                    type="button"
                    className="button outline small"
                    onClick={() => setStep(2)}
                  >
                    {t("Edit residence", "રહેઠાણ સુધારો")}
                  </button>
                  <button
                    type="button"
                    className="button outline small"
                    onClick={() => setStep(3)}
                  >
                    {t("Edit members", "સભ્યો સુધારો")}
                  </button>
                </FormActions>
                <h3 className="form-section">
                  {t("Declarations", "જાહેરાતો")}
                </h3>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={payload.declarations.accuracy}
                    onChange={(e) =>
                      update({
                        ...payload,
                        declarations: {
                          ...payload.declarations,
                          accuracy: e.target.checked,
                        },
                      })
                    }
                  />
                  {t(
                    "I have reviewed these details and confirm they are accurate for this application.",
                    "મેં આ વિગતો ચકાસી છે અને આ અરજી માટે તે સાચી હોવાની પુષ્ટિ કરું છું.",
                  )}
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={payload.declarations.authority}
                    onChange={(e) =>
                      update({
                        ...payload,
                        declarations: {
                          ...payload.declarations,
                          authority: e.target.checked,
                        },
                      })
                    }
                  />
                  {t(
                    "I am authorized to apply for the listed members. This does not give me unlimited access to another adult’s restricted information.",
                    "મને દર્શાવેલ સભ્યો માટે અરજી કરવાનો અધિકાર છે. આથી બીજા પુખ્ત વ્યક્તિની પ્રતિબંધિત માહિતીનો અમર્યાદિત અધિકાર મળતો નથી.",
                  )}
                </label>
                <p className="muted">
                  {t(
                    "No payment is required for this registration. A Family ID does not guarantee scheme eligibility.",
                    "આ નોંધણી માટે ચુકવણી જરૂરી નથી. પરિવાર ઓળખ યોજનાની પાત્રતાની ખાતરી નથી.",
                  )}
                </p>
              </>
            )}
            <FormActions>
              {step > 1 && (
                <button
                  type="button"
                  className="button outline"
                  onClick={back}
                  disabled={busy}
                >
                  <ArrowLeft size={16} />
                  {t("Back", "પાછા")}
                </button>
              )}
              {step < 5 ? (
                <button className="button" disabled={busy || saving}>
                  {busy
                    ? t("Saving…", "સાચવી રહ્યું છે…")
                    : t("Save and continue", "સાચવો અને આગળ વધો")}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="button"
                  disabled={
                    busy ||
                    saving ||
                    !payload.declarations.accuracy ||
                    !payload.declarations.authority
                  }
                  onClick={() => void finish()}
                >
                  {busy
                    ? t("Submitting…", "મોકલી રહ્યું છે…")
                    : t("Submit application", "અરજી મોકલો")}
                  <ArrowRight size={16} />
                </button>
              )}
              <button
                type="button"
                className="text-button"
                disabled={busy || saving}
                onClick={() => {
                  void save()
                    .then((v) => {
                      if (v) nav("/my/applications");
                    })
                    .catch(() => {});
                }}
              >
                <Save size={15} /> {t("Save and exit", "સાચવો અને બહાર નીકળો")}
              </button>
            </FormActions>
          </form>
        </div>
      </div>
    </div>
  );
}
interface Evidence {
  id: string;
  filename?: string;
  original_filename?: string;
  evidence_type: string;
  status: string;
  created_at: string;
}
export function EvidencePanel({
  applicationId,
  readonly = false,
}: {
  applicationId: string;
  readonly?: boolean;
}) {
  const { t } = useApp();
  const evidence = useResource(
    () =>
      api<List<Evidence> | Evidence[]>(
        "/applications/" + applicationId + "/evidence",
      ),
    [applicationId],
  );
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [type, setType] = useState("supporting_document");
  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    form.append("evidence_type", type);
    try {
      await api("/applications/" + applicationId + "/evidence", {
        method: "POST",
        body: form,
      });
      setFile(null);
      evidence.reload();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  const items = Array.isArray(evidence.data)
    ? evidence.data
    : evidence.data?.items || [];
  return (
    <div>
      <h3>{t("Supporting evidence", "સહાયક પુરાવા")}</h3>
      {evidence.loading ? (
        <Loading />
      ) : evidence.error ? (
        <ErrorBox error={evidence.error} />
      ) : items.length ? (
        items.map((e) => (
          <div className="request-row" key={e.id}>
            <FileText size={20} />
            <div>
              <strong>
                {e.original_filename || e.filename || e.evidence_type}
              </strong>
              <small>{formatDate(e.created_at)}</small>
            </div>
            <Status value={e.status} />
            {e.status === "clean" ? (
              <a
                href={"/api/v1/evidence/" + e.id + "/download"}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                {t("Open", "ખોલો")}
              </a>
            ) : (
              <small>
                {t(
                  "Download held pending safety review",
                  "સુરક્ષા ચકાસણી સુધી ડાઉનલોડ બાકી",
                )}
              </small>
            )}
          </div>
        ))
      ) : (
        <Empty title={t("No evidence uploaded", "કોઈ પુરાવો અપલોડ નથી")}>
          <p>
            {t(
              "Do not upload documents unless they are relevant to this request.",
              "આ વિનંતી માટે જરૂરી ન હોય તો દસ્તાવેજો અપલોડ ન કરો.",
            )}
          </p>
        </Empty>
      )}
      {!readonly && (
        <details className="demo-tools">
          <summary>
            {t(
              "Add optional supporting evidence",
              "વૈકલ્પિક સહાયક પુરાવા ઉમેરો",
            )}
          </summary>
          <Notice type="warning">
            {t(
              "Synthetic sample files only. Uploads are quarantined for review. This environment is not malware-certified.",
              "માત્ર કૃત્રિમ નમૂના ફાઇલો. અપલોડ ચકાસણી માટે અલગ રાખવામાં આવે છે. આ વાતાવરણ માલવેર પ્રમાણિત નથી.",
            )}
          </Notice>
          <Field label={t("Evidence type", "પુરાવાનો પ્રકાર")}>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="supporting_document">
                {t("Supporting document", "સહાયક દસ્તાવેજ")}
              </option>
              <option value="residence">
                {t("Residence evidence", "રહેઠાણનો પુરાવો")}
              </option>
              <option value="authority">
                {t("Authority evidence", "અધિકારનો પુરાવો")}
              </option>
            </select>
          </Field>
          <Field label={t("PDF, PNG or JPEG file", "PDF, PNG અથવા JPEG ફાઇલ")}>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Field>
          <button
            className="button outline"
            type="button"
            disabled={!file || busy}
            onClick={() => void upload()}
          >
            {busy
              ? t("Uploading…", "અપલોડ થઈ રહ્યું છે…")
              : t("Upload evidence", "પુરાવો અપલોડ કરો")}
          </button>
          {Boolean(error) && <ErrorBox error={error} />}
        </details>
      )}
    </div>
  );
}
