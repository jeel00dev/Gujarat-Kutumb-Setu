# Gujarat Kutumb Setu: frontend research and implementation specification

**Working Gujarati name:** ગુજરાત કુટુંબ સેતુ  
**Descriptive subtitle:** પરિવાર ઓળખ અને સરકારી સેવાઓ / Family identity and government services  
**Version:** 1.0 · Research checked 20 September 2026  
**Status:** Research-backed design and frontend implementation proposal; not an announced Gujarat scheme, approved brand, signed SRS, or authorization to access government data.  
**Companion:** [Gujarat Family ID requirements discovery draft](Gujarat_Family_ID_Requirements_Research_Draft.md), version 0.6: FR-01–140, NFR-01–65, D-01–46.

## 1. How to use this document

This document specifies the public website, resident transactions, assisted-service interface, staff workspaces, scheme information, department onboarding, content administration, and frontend quality gates. It is the handoff for interaction design and frontend development. Database tables, authoritative API specifications, infrastructure capacity, and government policy remain separate workstreams. No website implementation is included in this deliverable.

The frontend should make six tasks immediately discoverable: find an existing ID, apply, resume/track an application, request a correction, discover schemes, and obtain assistance. It should continue to work as a common entry point as departments join, while clearly identifying the authority that owns each record, scheme decision, certificate, and payment.

Evidence labels used throughout:

| Label | Meaning |
|---|---|
| **Observed** | Public page, document, screenshot, or browser rendering inspected during this research. Its current public presentation is evidence, not automatic Gujarat policy. |
| **Existing requirement** | Derived from the companion discovery draft. It remains proposed/conditional to the same extent as that draft. |
| **Design proposal** | A concrete choice for this product, grounded in the research but not claimed to be prescribed by government. All screen layouts, route names, component dimensions, and new product wording below are proposals unless identified otherwise. |
| **Decision required** | A named policy, content, integration, or operational choice needs an accountable government owner before the dependent production feature can launch. Designers may use clearly marked synthetic examples meanwhile. |

Use §§2–4 for evidence and branding, §§5–7 for information architecture and appearance, §§8–17 for screen behavior, §§18–21 for implementation and acceptance, and §§22–24 for decisions, traceability, and sources. New identifiers beginning `FE-` belong to this document and do not replace the companion's requirement IDs.

Quick navigation: [Research](#2-comparative-research-what-to-carry-forward) · [Name and logos](#3-product-identity-logos-and-current-government-content) · [Screens](#5-information-architecture-and-route-inventory) · [Visual system](#6-visual-system-and-page-shell) · [Homepage](#7-homepage-and-public-content-specification) · [Enrollment](#9-enrollment-wizard-and-field-specification) · [Schemes](#12-schemes-recommendations-applications-and-passbook) · [Accessibility](#16-accessibility-acceptance-specification) · [Acceptance](#21-design-handoff-verification-and-release-gates) · [Decisions](#22-frontend-decisions-requiring-governmentowner-approval) · [Traceability](#23-traceability-to-the-existing-requirements) · [Sources](#24-source-register-retained-evidence-and-access-notes).

### Research boundaries

- The workspace contained the companion Markdown only. `family_id_srs.excalidraw` and the separately described uploaded images were **not present**. Their counts and embedded-image contents were supplied in the conversation and recorded in the earlier draft; they were not independently re-counted here.
- The four recorded Excalidraw URLs were revisited: SATHEE IITK, UP Family ID, NeGD's UP case study, and the reconstructed Ghaziabad notice. The official NeGD process-flow image was recovered and visually inspected. This corroborates the described diagram but does not prove pixel-for-pixel identity with the missing attachment. [F01] [F03] [F04] [F05]
- This is a deliberately broad **representative review**, not a claim to have visited every government website. Government sites are numerous, dynamic, and sometimes inaccessible. The inventory below records what was actually inspected and the access limits.
- No resident identity, OTP, real application, payment, authenticated family record, or private department screen was submitted or accessed. All proposed inner screens are Gujarat design requirements, not reconstructions of another state's private interface.
- A current footer date does not prove that every scheme amount, instruction, or uploaded PDF is current. An observed link or logo does not establish a working integration, permission, or service-level commitment.

## 2. Comparative research: what to carry forward

### 2.1 Gujarat portals

| Reference | Evidence and access on review date | Observed features relevant to this product | Design consequence |
|---|---|---|---|
| **Ahmedabad district portal** [G01] | Live desktop rendering, screenshot, public text, and selected computed styles inspected. | Bilingual government identity; emblem; Digital India mark; utility controls; dark navigation with orange active state; service categories; contact/policy footer and ownership statement. | Use recognizable ownership and language controls. Put family tasks ahead of district news/tourism. Snapshot colours are observations, not a statewide palette. |
| **Gujarat SJE** [G02] | Official text available through web reader. Direct browser reached firewall CAPTCHA. | Gujarati/English controls, skip link, text-size and screen-reader links, welfare discovery, office-bearer section, RTI, policies, web information manager. | Use need-based scheme discovery and accountable publishing. No claim about its rendered colours or spacing. |
| **Digital Gujarat** [G03] [G04] | Naked hostname produced a certificate-name error in the local browser; `www` reached firewall CAPTCHA. GIL/DST explanatory pages readable through web reader. | Official descriptions cover online and assisted channels, reusable registration, tracking, and district/taluka/e-Gram access. | Discuss reuse with Digital Gujarat's owner; provide an assisted journey. No assumed SSO entitlement or undocumented login/API contract. |
| **Gujarat DST accessibility guidance** [G05] | Official text inspected; direct browser challenged. | Descriptive links, document metadata, explicit labels, semantic headings, keyboard support and text sizing are explained. Some browser instructions are legacy material. | Adopt the principles and test modern browsers; write current help rather than reproducing old browser-version instructions. |
| **Mari Yojana** [G06] [G07] | Official homepage text and 27-page manual inspected; selected manual screenshots examined. Direct live browser blocked. | Gujarati/English scheme discovery; sector/department and other search paths; forms and GR/order lookup; scheme summaries and application destinations. | Reuse approved catalogue content or link to this existing service. Avoid creating an independently maintained, conflicting scheme directory. Manual screenshots are a visual reference of uncertain capture date, not proof of today's live styling. |
| **Gujarat CMO** [G08] | Current page text available; local browser loaded content with incomplete CSS/images. | English/Gujarati, current CM information, news, contacts, government links including Mari Yojana, ownership and update date. | Verify office-bearer content from the owner. Partial rendering cannot establish typography or layout dimensions. |
| **Gujarat WCD** [G09] | Public text and individual scheme pages readable; direct homepage browser challenged. | Scheme descriptions, forms, GRs, contact directories, language/accessibility controls. | Explain the benefit, recipient, application route and owner on every scheme page; offer relevant local assistance. |
| **e-Samaj Kalyan, iKhedut, FCS** [G10] [G11] [G12] | Direct browsers reached firewall CAPTCHA; some web-reader requests also failed. Official directory and department references corroborate destinations. [G13] [G14] | Existence and relevant service ownership can be established; complete current screen flows and rendered themes cannot. | Treat as candidate approved destinations, not already integrated Family ID services. Obtain authorised demonstrations before connector acceptance. |
| **Gujarat state portal** [G15] | Browser certificate-name error; web reader failed. | No live visual claims used. | Resolve canonical government URL through the nodal owner before production linking; do not advise users to bypass certificate warnings. |

### 2.2 Family registries and national service discovery

| Reference | Public interface findings | Carry forward; limits |
|---|---|---|
| **UP Family ID** [F01] | Live browser shows prominent application, status, update and passbook actions; explanatory sections, FAQs, language/text controls; white, orange and olive-green surfaces. | Separate account access, family application, correction and benefit history. The exact authenticated implementation remains uninspected. |
| **UP registration/status and FAQ** [F02] [F02a] [F02b] | Public registration asks name/mobile; status starts with an application reference. The older FAQ distinguishes ration and non-ration families, assisted access and drafts. | Give each route distinct instructions. Do not inherit Aadhaar-only access, ID length, document rules or old post-issue edit restrictions as Gujarat requirements. |
| **Ghaziabad Family ID notice** [F03] | Describes ration number as the ID for UP ration families and a separate registration route for others. | Include PDS matching and non-PDS enrollment. Gujarat must separately decide whether its public ID equals a ration number. |
| **NeGD UP case study and diagram** [F04] | Official flow depicts PDS search, provisional reference, verification and approval; case study explains department integration. | Design visible intermediate states and source ownership. The picture is a simplified system/process reference, not a finished citizen screen specification. |
| **Haryana beneficiary/PPP portal** [F06] | Live browser offers known-ID, forgotten-ID, new-ID and mobile-update choices; scheme tiles; Hindi/English; support hours; dark grey footer. | Recovery and changed-phone access deserve first-class paths. Scheme tiles do not establish automatic eligibility or payment. Public descriptions of family visibility do not decide Gujarat's per-adult privacy rules. |
| **Gurugram PPP page** [F07] | Official district page links self-update, a blank family form, and assistance information. | Include assisted receipts and clear printable guidance, while keeping digital and assisted policies consistent. |
| **Rajasthan Jan Aadhaar** [F08] [F09] | Live browser/official pages expose enrollment, verification, e-card, update, helpdesk, manuals, schemes and integration guidance. Blue navigation/footer; separate scheme mark. Initial promotional modal encountered. | Cover the entire identity lifecycle. Place documents and staff materials in separate sections. Use a nonmodal service notice for ordinary announcements. |
| **MP Samagra** [F10] | Live Hindi homepage groups family/member registration, printing, profile changes, migration, death correction, temporary records, status and OTP/e-KYC help. | Support both family and member concepts; give exceptional changes explicit routes. Avoid forcing residents to understand technical identity terminology before starting. |
| **Karnataka Kutumba** [F11] | Live services page offers procedure/checklist separately from application, language/text controls, department login and content-owner footer; teal/blue presentation. | Provide prerequisites before starting; separate department access from citizen tasks. Public page's update date was 28 August 2024, so older content must be qualified. |
| **myScheme** [N01] | Live portal/text provide category/state/ministry discovery and scheme detail/application guidance. | Let residents browse without account creation; distinguish discovery from submitting an application to its owner. |
| **Telangana digital-card release** [F12] | Official September 2024 release describes a pilot proposal and aspirations. | Historical comparator only. This research does not certify current statewide functionality or reuse its proposed health profile as Gujarat enrollment fields. |

Uttarakhand appears in the team's earlier research but has no verified operational frontend specification in this evidence set. It contributes no mandatory Gujarat field or UI rule here.

### 2.3 Excalidraw references and recovered diagram

| Supplied reference | This review |
|---|---|
| SATHEE IITK UP article [F05] | Returned 403; no unseen contents relied on. |
| UP `Home_en.html` | Supplied older route was inaccessible through the web reader. The public `Home_en.aspx` page was inspected in a browser. [F01] |
| NeGD record [F04] | Read; linked `architecture.jpeg` visually verified as the described process diagram. [Local image](docs/frontend-research/up-flow.jpeg). |
| Wrapped Ghaziabad URL [F03] | Reconstructed URL opened successfully; ration/non-ration distinction corroborated. |
| FAQ screenshot | Missing original. Official UP FAQ PDF obtained and read; its older editing language is qualified. [F02] |
| Hindi quote/banner | Missing original. Live Haryana homepage contains the same general theme about reducing unnecessary human interaction. It is a Haryana message, not Gujarat policy. [F06] |
| Multi-state infographic | Missing original. Use verified primary state pages instead of treating the infographic's claims as specifications. |

The NeGD diagram's `UIDAI DB` box does **not** authorize direct database access. Its rejected branch marked deleted does not prescribe destructive record deletion. For Gujarat, expose an application receipt before approval, a policy-approved permanent ID after approval, and a reasoned rejection/correction/appeal path. Preserve the companion requirements for history and controlled changes.

### 2.4 Standards and scope

GIGW 3.0 is the government website baseline referenced by the companion. It covers identity/ownership, accessibility, security, content governance and lifecycle management; its accessibility material references WCAG 2.1. Government identity assets need proper authorized use. Citizen-facing policies and a responsible web information manager belong in the publication process. [N02]

Adopt **WCAG 2.2 AA as the proposed product acceptance target**, alongside applicable GIGW checks. This is a project recommendation; it is not a claim that GIGW's published accessibility baseline has silently changed. A component library, accessibility widget, or successful automated scan cannot certify the complete service. Certification follows the applicable STQC process. [N03] [N04]

DBIM describes Government of India digital identity. Its selected sections provide useful colour/type/identity references; applicability to this Gujarat project must be confirmed by the state owner. UX4G supplies government-oriented component guidance; assess selected components in context and self-host approved assets. Neither resource alone approves Gujarat policy, legal notices or data sharing. [N05] [N06]

## 3. Product identity, logos and current government content

### 3.1 Selected working name

**Design proposal: Gujarat Kutumb Setu / ગુજરાત કુટુંબ સેતુ.** Use the full name on first reference and `કુટુંબ સેતુ / Kutumb Setu` in constrained navigation. Keep `Family ID / પરિવાર ઓળખ` visible in the subtitle, help and search synonyms so people who know the generic service can find it.

The name connects a familiar Gujarati family term with access to services. Gujarat already uses Seva Setu/Digital Seva Setu, so branding must distinguish this registry service from those assistance initiatives. [G04] A preliminary search did not establish a government programme with the exact proposed full name; this is **not a trademark or name-clearance opinion**. A private app already uses “Parivar Setu,” so that alternative is not selected. [B01] Final naming and official Gujarati terminology require state communications approval.

Proposed explanatory line: `પરિવારની માહિતી અને સરકારી સેવાઓ માટેનું પોર્ટલ.` / `A portal for family information and government services.` Avoid a slogan promising every scheme, instant benefits, or a replacement for all documents. Label the pilot/prototype accurately until a launch order exists.

### 3.2 Identity asset register

| Asset | Placement and rule | Approval/source requirement |
|---|---|---|
| Government ownership mark/emblem | Masthead, undistorted, clear background; text names Government of Gujarat and the approved nodal department. | Obtain the exact approved lockup from Gujarat. Ahmedabad's use of the national emblem is an observation, not blanket permission for a new emblem composition. [G01] [N02] |
| Kutumb Setu service wordmark | Text wordmark next to ownership block; localized descriptor. | Proposed identity until approved. Design SVG/vector assets through the agency's normal brand process; do not fabricate an official seal. |
| Optional service symbol | Simple inclusive grouping/link symbol, with a monochrome version and small-size test. | Must work for single-person, guardian, joint and varied families; avoid depicting one family composition as the eligibility definition. |
| Digital India / Gujarat programme marks | Secondary partner strip only when actually applicable and authorized. | Asset owner, version and permission recorded. Appearance on another site does not require displaying it here. |
| NIC/GIL/hosting/developer credits | Footer text or marks only for actual appointed contributors. | Do not copy another site's “developed/hosted by NIC” credit for an agency-built system. |
| STQC/CQW or security badge | Only after certification, linked to valid scope and expiry information. | No placeholder certification badge in production. [N04] |
| Aadhaar/DigiLocker/service marks | Only within a legitimately approved connector journey. | Not a decorative homepage proof of integration. |
| Chief Minister portrait | Optional restrained “About the initiative” module or About page; never needed to complete a form. | Official owner-supplied photograph and approved caption; CMS-controlled and time-bounded. |

As checked on **20 September 2026**, the official CMO and SJE pages identify **Shri Bhupendra Patel / Shri Bhupendrabhai Patel** as Chief Minister. Proposed Gujarati caption: `શ્રી ભૂપેન્દ્રભાઈ પટેલ, માનનીય મુખ્યમંત્રી, ગુજરાત`. The department must approve its preferred name style and portrait. No Family ID nodal minister/secretary is assumed: SJE's office-bearers are not automatically this project's leadership. [G02] [G08]

CMS records for official people must include role, approved name in each language, asset reference, source, verified date, display start/end and reviewer. Reconfirm immediately before launch and following an office change. Campaign creatives and commemorative logos expire automatically on an approved date. Avoid political-party marks and fabricated quotations.

## 4. People, channels and service principles

These are **design hypotheses requiring field validation**, not results of interviews conducted in this research.

| User/context | Design requirement |
|---|---|
| Gujarati-first resident with a basic smartphone | Gujarati landing page; clear task verbs; limited page weight; large controls and visible recovery/help. |
| Resident comfortable with English or another language | Complete English parity, language persistence; confirm Hindi rollout and interpreter support under D-15. |
| Older person, person with low literacy, or first-time online applicant | Short explanations and one primary step at a time; printable instructions; accessible human assistance. |
| Person using screen reader, magnification, keyboard or switch input | Semantic structure, visible focus, reflow, plain errors and accessible authentication; no dependence on an overlay widget. |
| Family without ration card, Aadhaar, a personal mobile or fixed conventional address | An approved alternative/assisted route; absence of a source record is not proof of ineligibility. |
| Joint household, migrant, student living away, single person, guardian or disputed membership | Flexible policy-driven membership questions and private review; no fixed four-person template. |
| Adult using a shared phone or separating from a household | Account access and representation permissions are distinct; safe contact changes and restricted visibility into other adults' data. |
| e-Gram/Jan Seva/other authorized operator | Staff sign-in, resident-specific authority, repeatable intake, printing and explicit end-of-session purge. |
| Verifier, approver, grievance officer | Assigned work with jurisdiction, evidence provenance and accountable decisions. |
| Department integrator, content editor, auditor | Separate scoped consoles; documentation and synthetic testing; no unrestricted resident search. |

**FE-01:** Essential information, scheme browsing, document checklists and assistance must be usable without login.  
**FE-02:** A task page must say who it is for, prerequisites/alternatives, official fees, process, expected next step, approved timescale and help route. No fee or deadline is invented.  
**FE-03:** Reuse lawful, current information with a review opportunity; request additional evidence only for the applicable scenario.  
**FE-04:** Display source facts, declarations, review states, programme recommendations and final awards as different concepts.  
**FE-05:** Every blocked or unsuccessful task ends with a recoverable next step, responsible service and reference where available.

## 5. Information architecture and route inventory

Route paths below are implementation proposals. Use locale prefixes `/gu/` and `/en/` for public and resident pages. Persistent references in URLs must be opaque and access-controlled; never put Aadhaar, phone, name, certificate, bank, caste or family composition in a URL.

### 5.1 Public and resident screens

| Screen ID | Proposed path after locale | Purpose and access |
|---|---|---|
| P01 | `/` | Task-oriented home, notices, guidance, schemes, help. Public. |
| P02 | `/about` | Purpose, limits, mandate, governance, accountable department and approved leadership. Public. |
| P03 | `/services` | Service directory: find, enroll, correct, track, print/recover, complain. Public. |
| P04 | `/services/:slug` | Prerequisites, scenario-specific evidence, fees, timing, how-to and start action. Public. |
| P05 | `/find-id` | Explain existing-record check and recovery; authenticate before protected results. |
| P06 | `/apply/start` | Ration/no-ration/don't-know routing and readiness check. Public introduction. |
| P07 | `/track` | Application/change/grievance type and reference; approved challenge before detail. |
| P08 | `/schemes` | Public scheme catalogue and need-based search. |
| P09 | `/schemes/:slug` | Accessible scheme information, source/order, contact and actual application channel. |
| P10 | `/scheme-finder` | Optional brief guided discovery; approved sensitive answers handled privately. |
| P11 | `/help` and `/help/faq` | Help by task, searchable FAQ, guides, error recovery and contact choices. |
| P12 | `/help/centres` and `/help/centres/:id` | Maintained assisted-centre directory with supported services, location, hours, fees and accessibility. |
| P13 | `/contact` | Service support, office directory, hours, grievance/privacy/accessibility contacts. |
| P14 | `/notices` and `/notices/:slug` | Active/archive notices and service interruption information. |
| P15 | `/documents` and `/orders` | Manuals/forms plus acts, GRs and circulars with dates and metadata. |
| P16 | `/accessibility`, `/screen-reader-help`, `/sitemap` | Accessibility statement, usage help and HTML sitemap. |
| P17 | `/policies/:slug`, `/rti`, `/citizen-charter` | Approved public policies, RTI ownership and service commitments. |
| P18 | `/feedback` and `/grievances/start` | Distinguish website feedback from case grievance/appeal. |
| P19 | `/service-status` | Dated public availability notices, without internal topology. |
| P20 | `/statistics` | Conditional approved aggregate indicators and methods. |
| A01 | `/sign-in` | Resident access, help and recover/change-phone routes; return to intended task. |
| A02 | `/verify` | Transaction-bound OTP/approved challenge, timer/resend/recovery. |
| A03 | `/recover-access` | Forgotten reference, lost phone or changed representative recovery. |
| C01 | `/my` | Resident task dashboard. |
| C02 | `/my/family` | Authorized family summary and person-level visibility boundaries. |
| C03 | `/my/members/:opaqueRef` | Permitted individual facts, provenance, pending evidence and correction. |
| C04 | `/my/applications` and `/my/applications/:opaqueRef` | Drafts, submitted requests, timeline, evidence response and linked appeal. |
| C05 | `/apply/:opaqueDraft/:step` | Policy-driven enrollment wizard. |
| C06 | `/my/family/changes/new` | Choose supported correction/life event and affected scope. |
| C07 | `/my/changes/:opaqueRef` | Change request review, source handoff and implementation status. |
| C08 | `/my/benefits` and `/my/benefits/:opaqueRef` | Conditional passbook and permitted transaction detail/dispute. |
| C09 | `/my/scheme-applications/:opaqueRef` | Conditional referral/application/decision summary from owning department. |
| C10 | `/my/documents` | Approved family acknowledgement/card downloads and document history. |
| C11 | `/my/notifications` and `/my/preferences` | Safe messages, contact/language preferences and session settings. |
| C12 | `/my/permissions` and `/my/access-history` | Scoped representation, optional sharing choices and lawful disclosure history. |
| C13 | `/my/grievances/:opaqueRef` | Grievance messages, response, escalation and appeal, as authorized. |
| C14 | `/receipts/:opaqueRef` | Authorized printable receipt; no permanent public document URL. |

All screens also have language-missing, 404, forbidden, expired-session, service-unavailable and maintenance handling. A missing translation must not silently send a resident to an unrelated homepage.

### 5.2 Staff, administration and department screens

Use separately authorized application shells, preferably separate approved origins/session audiences. Prefixes describe scope rather than prescribing deployment topology.

| Workspace | Required screens |
|---|---|
| S01–S03 `/assisted` | Operator dashboard/centre context; begin resident session and authority; assisted enrollment/update/recovery using the same policy schema. |
| S04–S06 `/work` | Assigned queue; case/evidence comparison; verification record and recommendation. |
| S07–S08 `/decisions` | Approver queue and reasoned decision; supervisor reassignment/escalation. |
| S09–S10 `/redress` | Grievance/appeal queue; sensitive/disputed membership and source-correction case. |
| S11 `/stewardship` | PDS/import discrepancies, source conflicts and correction propagation. |
| S12 `/audit` | Authorized access/decision/disclosure history and approved export request. |
| S13 `/reports` | Scoped operational aggregates, freshness, backlog and exclusion/recovery metrics. |
| M01 `/admin/content` | Bilingual publishing, preview, review, scheduled expiry and archive. |
| M02 `/admin/reference-data` | Versioned geography, evidence, service guides, office/centre contacts. |
| M03 `/admin/access` | Role, jurisdiction, delegation, expiry and access review. |
| M04 `/admin/schemes` | Scheme catalogue, lifecycle, controlled rules/content and integration state. |
| M05 `/admin/integrations` | Approved connector state, freshness, reconciliation and notices. |
| D01 `/departments` | Public introduction, onboarding prerequisites and contact. |
| D02 `/developers/docs` | Approved API/event concepts, versioning, errors, synthetic examples and change log. |
| D03–D05 `/partners` | Authenticated onboarding request; scoped app/credential management; synthetic sandbox/conformance results and integration health. |

**FE-06:** A universal component library may serve these workspaces, but resident sessions must never gain staff/department powers from a hidden menu, client flag, URL or role selector. Server authorization governs every object and action.

## 6. Visual system and page shell

### 6.1 Observed colours versus selected tokens

Selected computed values from the browser inspection: Ahmedabad active navigation `#F37020`; UP highlighted navigation `#F1832E`, primary task buttons `#7F8D00`, footer `#D05B00`; Rajasthan blue actions/footer `#005CA4`; Haryana footer `#515151`. These snapshots demonstrate variation. They are **not recommended contrast combinations** and are not a Gujarat branding standard. [G01] [F01] [F06] [F08]

The Mari Yojana manual shows a white-ground interface with dark blue section/table bars, orange accents and a distinct Gujarati scheme mark. Its navigation/search and scheme-detail screenshots support a restrained, information-led direction. These are visual observations from the manual, not sampled live colour tokens or proof of its current mobile behavior. [G07] [Homepage evidence](docs/frontend-research/mari-manual-page-2.png), [scheme-list evidence](docs/frontend-research/mari-manual-page-7.png).

**Design proposal:** use the DBIM blue group, verified in Figure 1, printed page 6/PDF page 26, as the starting palette: `#162F6A`, `#214AAB`, `#5279D7`, `#A3BBF3`, `#D2DFFF`. Use its Noto Sans direction with a Gujarati-capable companion font. State approval is still required. [N05] [Palette evidence](docs/frontend-research/dbim-palette.png).

| Token | Proposed value | Usage |
|---|---|---|
| `brand-900` | `#162F6A` | Navigation, footer, strong headings and primary hover state. |
| `brand-700` | `#214AAB` | Primary actions and links on white. |
| `brand-500` | `#5279D7` | Decorative/selected accents; do not assume small white text passes contrast. |
| `brand-200` | `#A3BBF3` | Nontext accents or pale selected borders. |
| `brand-100` | `#D2DFFF` | Information/selected surfaces with dark text. |
| `surface` / `page` | `#FFFFFF` / `#F5F7FA` | Main cards and restrained page separation; page colour is a project extension. |
| `text` / `muted-text` | `#1F2937` / `#4B5563` | Body and secondary text; project extensions. |
| `input-border` / `divider` | `#6B7280` / `#D1D5DB` | Discernible controls versus nonessential separators. |
| `success` | `#146C43` on `#ECFDF3` | Positive status accompanied by text/icon. |
| `warning` | `#854D0E` on `#FFF7D6` | Pending or attention message, not rejection. |
| `error` | `#B42318` on `#FEF3F2` | Error border/summary with explicit reason. |
| `focus` | `#214AAB` with white offset | Minimum 3px visible outline; on dark surfaces use a contrasting light outline. |

Status/neutral extensions are **project choices**, not quoted DBIM tokens. Verify every rendered text/background and control/state combination. Logo colours remain the approved artwork's colours. No gradients, glossy panels, animated counters, parallax, background video or auto-rotating hero are needed for the proposed product.

### 6.2 Typography, sizing and responsive behavior

| Item | Proposed specification |
|---|---|
| Fonts | Self-host licensed Noto Sans and Noto Sans Gujarati, including required script coverage and license notices; system fallback. No runtime Google Fonts request. Validate actual shaping and PDF embedding. |
| Body | 18px preferred in citizen reading/forms; 16px minimum for ordinary staff/table text. Gujarati line-height about 1.65; English about 1.5. Test and adjust with native readers. |
| Type scale | H1 32/40px desktop, 26/36px mobile; H2 24/34px; H3 20/30px. Sizes are size/line-height starting points and must grow with user settings. |
| Metadata | 14px minimum for noncritical metadata; essential instructions and errors stay at body size. |
| Measure | Reading blocks approximately 65 characters wide; form content max 720px; public page max 1200px; staff evidence screens may use 1440px. |
| Spacing | 4px base; normal rhythm 8/12/16/24/32/48px; small 4–6px corner radius and light border, minimal shadow. |
| Inputs/buttons | At least 48px normal height; labels above, helper below; text may wrap and increase height. Minimum proposed interactive target 44×44 CSS px. |
| Responsive rules | At 320–767px: one-column citizen forms; 768–1023px: optional two-column summaries; at 1024px+: full navigation and up to three task cards per row. These breakpoints are proposals, not official standards. |
| Overflow | Reflow long Gujarati labels; no fixed text heights. Tables needing two-dimensional layout get a labeled scroll region or stacked read view; essential text is never clipped. |
| Motion | Respect reduced-motion preference; ordinary transitions ≤150ms. No animation communicates the only status information. |
| Print | A4 and useful black-and-white output; omit navigation and controls; preserve government owner, title, reference, issue/update time and status; text remains selectable. |

### 6.3 Header and navigation

**FE-07:** Every shell displays accurate government ownership and service context. Public desktop order:

1. Utility row: skip-to-content link; Government of Gujarat; `ગુજરાતી | English`; accessibility options; help. Show a helpline only after assignment is confirmed, with hours nearby or a linked contact page.
2. Identity row: approved government mark + localized service name/descriptor; one resident sign-in action. Public search is visibly labeled and confined to public information.
3. Primary navigation: **Home · Family services · Schemes · Help · About**. Notices/documents are discoverable through relevant sections and footer. Clearly separate staff and department access in the footer/access page.
4. Internal pages: breadcrumb, page title and relevant status/last-reviewed date.

On mobile, keep name, language switch and labeled Menu/Sign in controls. Expand a keyboard-operable menu with `aria-expanded`; Escape closes it and returns focus. Do not rely on hovering, flags as language labels, or an unlabeled hamburger. Avoid a tall sticky masthead over forms. When a compact task bar is sticky, it must not cover fields, error summaries, keyboard focus or the software keyboard.

Resident shell: current task context, `My home`, family/applications, benefits where available, help, notifications and sign out. Display whose record is being acted on without showing unnecessary private details. Assisted shell always displays operator role/centre and **acting for [resident]** as separate identities.

### 6.4 Footer

**FE-08:** Use grouped links, then ownership and update metadata. Required content slots:

| Group | Content |
|---|---|
| Service help | How to apply; track; corrections; FAQs; assisted centres; contact; grievance; accessibility help. |
| Programme/governance | About/mandate; acts/GRs/orders; citizen charter; RTI/disclosures; web information manager; department information. |
| Website policies | Privacy; terms; accessibility statement; copyright; hyperlinking; disclaimer; feedback; sitemap. |
| Government destinations | Approved Gujarat portal, Mari Yojana, Digital Gujarat and relevant owner portals; label external destinations. |
| Ownership | `Content owned by [approved department], Government of Gujarat`; actual maintenance/development/hosting credit; verified contact; meaningful reviewed date. |

Do not publish an invented office, call-centre number, support availability, fee, NIC credit or security certificate. Do not substitute a visitor counter for content freshness. Related government logos are optional approved links, not a compulsory carousel. Public policies may be linked from a grouped policy page, but privacy/accessibility/help remain direct links. Operational security plans belong in controlled documentation, not the public footer.

## 7. Homepage and public content specification

### 7.1 P01 composition

Proposed desktop arrangement:

```text
Government identity | Gujarati / English | Accessibility | Help
Approved mark  Gujarat Kutumb Setu                 Sign in
Home | Family services | Schemes | Help | About       Search
[Dated service notice only when applicable]

Family information and government services
Short explanation, coverage and service limits

[Find my Family ID]   [Apply for Family ID]   [Track / resume]
[Update details]     [Find schemes]          [Get help]

Have a ration card?                         No ration card / unsure?
Short explanation + check route              Short explanation + start route

How it works: Check -> Provide details -> Review -> Track outcome
Find schemes by need + browse all            Help near you
Latest relevant notices (max 3)              Common questions
About / accountable department / optional restrained leadership block
Policy links | verified support | ownership and actual reviewed date
```

On mobile preserve this reading order; use one-column task rows if translations do not fit two columns. Put **Find**, **Apply** and **Track** before promotional imagery and detailed programme history. Primary tasks should be discoverable within the first short scroll at 360px, without hiding other required information behind a rotating banner.

**FE-09:** Home is a working task index. Each action has one clear destination and a one-sentence explanation. Resume/track routes stay distinct after selection; users must not mistake saving a draft for submission.

**FE-10:** Home contains no personal-ID lookup results, live beneficiary lists, caste totals for tiny locations, fabricated population statistics, or promised benefit amounts. Approved aggregate statistics belong on a methods-backed page; omit the module until genuine publishable data exist.

Proposed hero copy: `પરિવારની માહિતી નોંધાવો, અરજીની સ્થિતિ જુઓ અને યોજનાઓ શોધો.` / `Register family information, track requests and find government schemes.` Explain immediately that individual schemes have their own rules and responsible departments. In an unlaunched prototype use a clear demonstration banner; a live pilot must name its actual coverage.

### 7.2 Required public content

| Page | Required content and behavior |
|---|---|
| About | What the registry does; who may enroll under approved policy; limits of the ID; nodal owner; mandate/order; relationship with existing portals; grievance/privacy contacts. |
| Service guide | Audience, prerequisites, accepted alternatives, steps, channel, charges, published timelines, responsible office, output, tracking and appeal. Print-friendly. |
| FAQ | Group by access, ration/no ration, members, documents, status, changes, benefits, privacy and help. Answers reference approved rules and dates; search returns answer links, not only PDFs. |
| Documents | Title, language, owner, version/date, type, actual size, accessibility format and HTML equivalent. Clearly identify archived/replaced orders. |
| Notice | Title, affected service/geography, issue/effective/end date, action required, alternative channel, owner and source. No scrolling marquee. |
| Contact | Service-specific assistance first, then office directory. Named role/office, verified phone/email, hours, address and accessible options. Do not use another programme's helpline as the Family ID helpline. |
| Centres | District → taluka/city → village/ward plus text search; list view is sufficient without GPS or a third-party map. Show services actually enabled at that centre, holiday exceptions and last verified date. |
| Citizen charter | Approved service times and fees, escalation and service boundaries. Distinguish department decision time from SMS/technical response time. |
| Public service status | Current impact and last update; affected external dependency described in plain language; workaround and next update. No false “all operational” if checks are unavailable. |
| Accessibility statement | Target/version, audit scope/date, known limitations, alternatives, assistive-technology testing and a monitored contact. Claim conformance only to demonstrated scope. |
| RTI | Relevant authority, disclosure links and actual information-officer channel approved for this programme; not an invented generic officer. |

Public content search must cover services, scheme synonyms, documents, notices and FAQs. Display meaningful result types, short summaries and language. A search such as `રેશન`, `ration`, `પરિવાર આઈડી`, `Family ID`, `શિષ્યવૃત્તિ`, or `scholarship` should find the curated corresponding topics. Never send private form fields or authentication identifiers to public search analytics.

## 8. Resident access, recovery and existing-record checks

### 8.1 A01–A03 access

**FE-11:** Separate three assertions in UI and contracts: control of a contact channel, verified identity, and authority to act for a person/family. A successful mobile OTP proves only what the approved access policy says it proves. It does not automatically complete Aadhaar e-KYC or authorize disclosure about all adults on that phone.

| Screen/state | Required behavior |
|---|---|
| Sign in introduction | Explain purpose and approved methods; preserve intended task. “Continue an application” must not create a new household. Reuse a Gujarat identity provider only under a confirmed agreement. |
| Contact entry | Visible mobile label, ownership/shared-phone help, alternative-access link; optional email only if the service supports it. No mandatory email assumption. |
| Challenge sent | Mask destination; show which verification is happening; provide change-contact, resend and help. OTP lifetime, length and retry rules come from the server policy. |
| OTP entry | Prefer one labeled input supporting paste/autofill and mobile keyboard. If segmented, screen-reader and whole-code paste behavior must be equivalent. Never disable password managers or copy/paste. [A01] |
| Incorrect/expired/limited attempts | Distinct actionable text without revealing whether another person's account exists; accessible retry time and alternate route. Never reset every completed application step. |
| Gateway unavailable | Explain temporary unavailability and offer retry/assistance; do not display “invalid Aadhaar/mobile” for a provider timeout. |
| Additional identity/authority required | State the reason and permitted alternatives before collecting further evidence. Use an authorized identity service through the backend, never direct UIDAI database access. |
| Session expiring | Warn with time to extend when allowed; server-saved draft retained under policy. Reauthentication restores the task, not an empty form. |
| Lost phone/forgotten ID | Explain assisted recovery and evidence; issue a recoverable case where authorized. A new mobile must not silently gain every previous holder's records. |
| Sign out | End server session, clear in-memory sensitive state and private caches. Shared-device users see a safe confirmation. |

Do not add commercial CAPTCHA, social login, WhatsApp-only access or browser biometric collection by default. Where anti-abuse challenges are required, provide an accessible equivalent approved with security owners; an audio-only alternative does not serve every user. Technical CAPTCHA failure must have a human-help path. [A01]

### 8.2 P05/P06 routing

Ask: **“Do you have a ration card?”** with `Yes`, `No`, `I am not sure / cannot find it`. Also expose `I already have a Family ID` and `I started an application`. Do not require a resident to understand “PDS” as an acronym.

| Result after authorized check | Required presentation and next action |
|---|---|
| Existing family, authorized member | Show minimum permitted family summary, source/date and existing-ID status; continue to view or request correction. No duplicate enrollment. |
| Ration record exists, registry linkage not ready | State that linking needs review; show reference/next step if a case was created. Do not invent a permanent Family ID. |
| No ration card | Enter independent enrollment, with the applicable approved checklist. |
| Ration holder, no match | Distinguish unavailable source from completed no-match; offer recheck, assisted discrepancy case or authorized non-PDS route. |
| Wrong or multiple candidate match | Do not expose candidate households. Let the resident contest the association in a restricted case. |
| Card forgotten/reissued/cancelled | Recovery/source-owner route; preserve existing registry identity where already known and lawful. |
| Source down/stale | Keep draft and reference; show pending verification and an accessible alternative, never “not eligible.” |

**FE-12:** PDS prefill is read-only as a source assertion but challengeable. “Request correction with Food and Civil Supplies” is different from editing a registry declaration. Show the correct owner and track a referral only when an integration or staff case actually exists.

**FE-13:** Gujarat's public ID is an opaque identifier rendered as text. Do not hard-code UP/Haryana/Rajasthan digit counts, infer personal characteristics, or display a ration number as the Gujarat Family ID before D-04/D-26 are settled.

## 9. Enrollment wizard and field specification

### 9.1 Proposed step sequence

After routing and access, show a short stepper and `Step n of m`. Conditional steps change the total truthfully. The default design has six stages:

| Stage | Screen content | Completion condition |
|---|---|---|
| 1. Applicant and authority | Applicant, whether acting for self/another person, contact and language; privacy-purpose explanation. | Applicable identity/contact/representation checks completed or approved exception recorded. |
| 2. Residence | Urban/rural/locality details from current authoritative geography; accepted address alternative. | Required jurisdiction and residence assertions validated. |
| 3. Family members | Add/list/edit members one at a time; relationship and membership; source facts and disputes. | Each member has sufficient policy-approved data or an explicit pending/exception outcome. |
| 4. Required evidence | Checklist generated from scenario; reuse authorized verified source; file capture only where needed. | Evidence complete or acceptable exception/review state. Skip upload when none is required. |
| 5. Review and declarations | Readable summary with edit links, evidence/source status, fee if any, consent/attestation in chosen language. | Resident can correct errors and makes only applicable, separate attestations. |
| 6. Submit and receipt | One server-confirmed submission, acknowledgment and truthful next steps. | Durable application reference received; safe retry/recovery when response is uncertain. |

**FE-14:** Steps have Back, Save and continue, and Save and exit. Back does not discard entered data. Show `Saving…`, `Saved at…`, `Not saved — connection interrupted` based on actual server acknowledgments. Do not display success solely because local form state changed.

### 9.2 Candidate form dictionary

`Core candidate` means the field should be supported in the UI model, **not that Gujarat has already made it mandatory**. Requiredness, accepted evidence and alternatives must come from a versioned approved policy keyed by scenario and effective date.

| Field/group | Control and collection rule | Validation, provenance and exception |
|---|---|---|
| Applicant name | Unicode text; source-script name plus Gujarati/English display if approved. | Preserve spelling; allow spaces, initials, single names and relevant punctuation. Do not require a surname or silently transliterate an official name. |
| Contact mobile | Text with `inputmode=tel`; language and contact ownership options. | Do not use numeric type or assume phone uniqueness. A shared contact can serve multiple authorized people. |
| Email | Optional email control if used by approved notifications. | No barrier where resident has no email. |
| Acting capacity | Self, authorized representative, guardian or another policy-approved role. | Show additional authority proof only for that role; no automatic male/female head rule. |
| Applicant identity | Approved identity-method choice and minimal evidence result/reference. | Conditional Aadhaar/e-KYC only after authorized notice and integration; alternate review is explicit. Raw biometrics are not frontend form fields. |
| Address | Address lines/locality; state, district, taluka/urban body, village/ward, PIN as applicable. | Load versioned official codes; do not hard-code district counts. A changed parent selection warns before clearing dependent fields. PIN is not proof of jurisdiction/residence. |
| Residence situation | Policy-approved current/temporary/other accepted situation and effective date where needed. | Do not require property ownership or GPS. Provide accepted alternatives for homelessness, rental or uncertain address. |
| Family representative | Select an eligible member or record pending nomination according to policy. | Separate role from immutable person identity; replacement is a controlled request. |
| Member name | Repeating person record with original/alternate script displays. | Keep individual provenance; don't overwrite source name to fit a form length silently. |
| Date of birth / age | Accessible date text fields; accepted estimated age/approximate date if policy permits. | Show expected format and estimation flag. No fake 1 January default. Impossible/future dates need correction or relevant pending case. |
| Relationship | Policy-owned code list, clear labels, reference person and effective dates if needed. | Relationship to representative is not sufficient to infer marriage/parentage or all scheme subfamilies. Disputed/unknown states remain explicit. |
| Member residence/membership | Relevant living-away/current membership questions, only under approved definition. | Temporary study/work absence must not automatically create duplicate identity or remove membership. |
| Minor/guardian authority | Conditional guardian relationship and approved evidence. | Do not force a newborn to have an individual phone or unapproved identity document. |
| Gender, marital status, occupation | Conditional approved lists with appropriate unknown/not-collected states. | Never add them as mandatory only because a comparator did. No category inferred from name or appearance. |
| Ration/source reference | Authorized external identifier plus owner and last-check time. | Preserve leading zeros; mask as required; recovery available. Source-linked status is distinct from NFSA entitlement. |
| Income/caste/disability/education | Collect only if approved baseline purpose or within a named scheme journey. | Distinguish declared, certified, unknown, expired, disputed and revoked. Caste/certificate belongs to the named individual. |
| Bank/payment information | Not a default family enrollment section. | Only within an explicitly approved financial service, normally maintained by its payment owner; no assumed family-head payment account. |
| Evidence | Type, holder, issuer/reference where needed, date, secure file/token, verification state. | Policy-driven accepted file types/size and alternatives; no assumed universal 200KB limit or compulsory upload. |
| Communication preferences | Available channel, language, safe-contact choice and notification type. | Essential service notices and optional scheme outreach are separate; no prechecked promotional permission. |
| Declaration | Plain summary and correct acting person's attestation; optional sharing choices separate. | Record notice/declaration version, language and time. Do not describe every statutory processing activity as revocable optional consent. |

### 9.3 Member editor and evidence behavior

**FE-15:** Show members in an accessible list with name, relationship, record/evidence status and permitted actions. A family tree can be an optional aid with an equivalent list; it must not be the sole way to edit. Do not show a fixed number of member slots as a policy limit. Large families use bounded loading without losing members.

Removing a not-yet-submitted draft entry requires confirmation with a clear Undo where practical. Removing/transferring a registered person is a change request; a trash icon must never permanently delete a person record. One disputed member must not make the UI imply that all other members are fraudulent or ineligible.

**FE-16:** Upload component states: select/capture → local basic validation → upload progress → server scanning → accepted/pending review or failed. File extension alone does not prove safety. Explain type/limit before selection; offer retry/remove/change after failure and accessible input instead of drag-and-drop-only. A passed malware scan is not verification of document truth. Never request multiple reuploads because a user navigated Back.

Show authorized existing evidence as reusable with holder/source/date and scope. Expired or unverified documents are labeled. Camera permission is requested only when the resident chooses capture; file selection and assisted capture remain available. PDF/JPEG/PNG are candidate supported types, subject to the owner’s matrix. File names and contents are excluded from analytics and public URLs.

### 9.4 Review, submission and receipt

**FE-17:** Review is a readable summary, not a disabled copy of a long form. Each section has an Edit link that returns to the same summary afterward. Show declarations and source verification separately. Use `Submit application` rather than `Generate ID` unless issuance is actually complete at that step.

**FE-18:** Disable duplicate clicks while a request is pending, but rely on backend idempotency. For an ambiguous timeout, check the existing submission intent before offering another submit. Present `We are checking whether your application was received`; do not claim either success or failure without evidence.

Receipt includes application reference, task type, submission time/timezone, permitted applicant summary, current state, evidence still due, responsible office/channel, official fee/payment receipt if applicable, tracking instructions and verified help. It says **application acknowledgment**, not permanent ID. Offer accessible HTML print and tagged PDF. No browser-local “success” receipt before durable submission.

### 9.5 Conditional certificates and person-specific assertions

For any approved certificate/profile module, display the named holder, claim type, issuer, protected reference, territorial/list applicability, issue/validity dates, source-check time and verification state. A self-declared community, a caste certificate, inclusion on a particular state/central list, non-creamy-layer status, income certificate and EWS determination are **different facts**. Do not reduce them to a single inherited family-category dropdown.

People in one family may have different certificate histories and categories. Marriage, adoption or a representative change must not automatically change another person's category. Source mismatch, missing certificate, expiry, revocation and pending appeal each need an explanation and the correct issuing authority's correction/application route. Show a certificate-referral receipt only if a real request was accepted; an outbound link alone is not an application. A source outage must not turn unrelated family enrollment into an error or an unknown category into a negative scheme decision. Restricted details are omitted from other members' responses and default cards, not merely hidden using CSS.

## 10. Tracking, resident dashboard and identity documents

### 10.1 Status vocabulary

**FE-19:** API status codes map to approved localized labels. Application state, identity verification, source synchronization and benefit status are independent fields. Display an unknown future status safely as `Status being updated` with support/reference; never map it to Approved by default.

| State | Resident explanation | Allowed next step |
|---|---|---|
| Draft | Saved, not submitted. | Resume, amend or discard draft under policy. |
| Submitted/received | Application received with reference. | View receipt; permitted withdrawal. |
| Waiting on resident | Specific missing information, reason and actual due date. | Supply evidence/correction; ask for help or extension if supported. |
| Waiting on source | Named source verification remains outstanding. | Track or use defined alternative; avoid asking resident to fix a technical outage. |
| Under verification | Responsible office is reviewing; last action shown. | Respond if requested; contact/escalate per policy. |
| Field visit required | Purpose and approved arrangements; no fake appointment slot. | Confirm through supported channel; request accommodation. |
| Approved | Decision made, with scope and date. | View decision; wait for issuance/implementation if separate. |
| Issued / change implemented | Public ID or approved change is actually available in the authoritative view. | View/download permitted document and updated record. |
| Rejected | Reason, decision authority, date and available remedy. | Correct/resubmit or appeal under policy; preserve original linkage. |
| Disputed / duplicate review | Association needs review; no public accusation of fraud. | Provide private clarification or independent review request. |
| Under appeal | Linked appeal and responsible authority. | Track/respond. Original decision remains in history. |
| Withdrawn / closed | Outcome and reason, preserving appropriate history. | Approved reapplication/reopening path if available. |

Each timeline event includes date, actor **office/role** rather than unnecessary personal staff information, meaningful description and next action. Proposed public progress diagrams use completed/current/upcoming steps, not an invented percent complete. Publish a due date only when the relevant process policy supplies it; show overdue and escalation honestly.

### 10.2 C01–C04 dashboard and records

Place **actions requiring attention** first, followed by active requests/drafts, the authorized family summary, corrections, and scheme recommendations/passbook if available. A resident who has no family record sees enrollment/recovery guidance, not an empty chart dashboard. Avoid showing financial/category/health information on the first shared-device screen.

Family and member detail show permitted values with source owner, declared/verified status and as-of date. Place `Request correction` next to the affected fact and explain where it will be resolved. Do not send hidden restricted values in the browser payload just because they are masked visually.

### 10.3 C10/C14 documents and verification

**FE-20:** A Family ID document is a registry record with a stated purpose, not a ration card, caste certificate, citizenship document or benefit approval. Show approved issuer, public identifier, relevant safe display data, issue/version date and verification instructions. Card contents, representative/member visibility and validity wording depend on policy.

If QR verification is approved, use an opaque, minimal verification reference or signed minimal payload and a human-readable alternative. QR must not contain raw Aadhaar, full bank number, caste or unrestricted family/member records. Possession of a QR is not authorization to view a family's private history. The verification service itself requires its own disclosure and anti-enumeration design.

Print/download must preserve Gujarati glyphs, sensible page breaks, selectable text and accessible structure. A paper copy has an issue/as-of date; do not imply it automatically updates after a correction. Provide corrected-document history to authorized users.

### 10.4 C11/C12 notifications, preferences and access history

The authenticated inbox groups required actions, case updates and optional scheme suggestions, with reference, date, read state and a safe deep link. Reading a message is not acknowledgment of a legal declaration. SMS/email previews contain only approved minimal text; require appropriate access before displaying a sensitive decision or document. Delivery failure is distinct from a resident declining/ignoring a request and must not silently trigger an adverse case outcome.

Preferences distinguish language, current verified contact, safe-contact method, essential service communications and optional outreach. Changing a phone is the controlled access/contact journey, not an unverified editable text value. Support notification accessibility and resident recovery without assuming every member owns a smartphone.

Access history shows the authorized authority/department, purpose, time, permitted categories of facts and relevant case/reference to the extent disclosure is allowed. Explain material exceptions and provide a privacy-dispute route; do not expose another adult's restricted disclosure or internal security details. Representation/sharing controls identify person, task, legal/consent basis, expiry and withdrawal/revocation effects. Revoking optional sharing is not represented as deletion of all lawfully retained registry history.

## 11. Corrections, life events, representation and grievances

### 11.1 C06/C07 change-request flow

**FE-21:** Select event/fact → select affected person/family → explain authority/evidence → proposed change/effective date → review → submit → track approval **and implementation**. Use the same accessible evidence, draft and receipt components as enrollment. Keep an existing verified value visible as current until an authorized change takes effect.

| Change type | Additional UI and controls |
|---|---|
| Spelling/DOB/relationship correction | Compare permitted current and proposed value; show source owner and evidence; explain scheme impact only where owner provides it. |
| Address/contact change | Distinguish contact reachability from legal residence; handle shared/recycled phone, jurisdiction change and safe notifications. |
| Add child or another member | Scenario-specific identity/age/guardian evidence; detect existing person before creating one. |
| Marriage/separation/divorce | Controlled membership and representation changes; sensitive reasons hidden from unnecessary viewers; no automatic spouse transfer. |
| Transfer | Minimal origin/destination references, effective date, authorization and disputed-case option. Destination lookup must not reveal another household. |
| Split/merge | Approved affected-member set, retained identities, proposed resulting memberships, notices and independent review. Never a one-click destructive merge. |
| Change representative | Current/proposed role, authority and succession/dispute handling; preserve Family ID. |
| Report death / correct erroneous death | Compassionate wording; source confirmation and review; explain that owning schemes decide consequential action. Restore route for erroneous reports. |
| PDS/certificate/utility/asset correction | Identify source owner; link or submit a real supported referral. Do not let registry staff overwrite another issuer's fact. |
| Withdrawal/deactivation | Explain scope and consequences under approved rules; strong confirmation/reauthentication where required; retain mandated history. |

**FE-22:** Family membership is not blanket delegation. An adult may authorize a narrowly scoped action without exposing all benefits. Representation UI shows person, allowed tasks, basis, expiry and revocation/contest route. Special protection cases such as domestic separation must support an approved confidential contact/review workflow; a generic notification to the former representative may be unsafe.

### 11.2 P18/C13 redress

**FE-23:** Offer separate choices: website problem, application delay, incorrect family/member link, source-record dispute, benefit-report dispute, access/privacy concern, operator charge/misconduct, and appeal of a decision. Display what each route can resolve. Grievance need not require a permanent Family ID; provide reference-based or assisted intake under policy.

Fields: issue category, related reference if known, concise description, safe response channel, necessary evidence and explicit consent/authority where relevant. Anonymous misconduct reporting is conditional on approved process; do not promise anonymity without supporting controls.

Confirmation supplies its own complaint/appeal reference, responsible authority, tracking method and genuine timescale. Show received → assigned → response required → decision → closed/reopened/appealed as applicable. A “resolved” action must show the resolution and available contest route. Route complaints about an operator outside that operator's control; restricted attachments cannot be shown automatically to the person complained about.

## 12. Schemes, recommendations, applications and passbook

### 12.1 P08/P10 discovery

**FE-24:** Browse and keyword search are public. Start with familiar needs: food/ration, education, health, women/children, older people/pensions, disability support, farming/livelihood, housing and other services. These are discovery categories, not eligibility determinations. Use an icon plus a text label; do not depend on imagery alone.

Offer filters for topic, beneficiary type, department, geographic applicability, current application availability and assistance type. Keep optional sensitive personalization out of ordinary URL parameters and logs. Let residents skip questions, choose `I don't know`, remove filters and browse all schemes. Use a short guided sequence rather than a mandatory full demographic survey.

Show result count, selected filters, accessible sort, pagination/load-more, clear reset and an informative no-results message. Do not interpret an unavailable catalogue API as zero schemes. Preserve browse context on return from a detail page. Transliteration/synonyms help discovery but must not alter legal scheme names or personal data.

**Integration design:** seek a maintained content contract with Mari Yojana and the respective scheme owners. In its absence, use owner-reviewed local catalogue entries linking to official detail/application pages. Do not scrape and publish sensitive eligibility rules as executable policy without owner review. Catalogue integration and registry-data-sharing approval are separate agreements. [G06] [G07]

### 12.2 P09 scheme-detail template

| Section | Required fields/content |
|---|---|
| Identity | Official localized name, scheme owner, stable external reference where available, summary and source. |
| Benefit | Kind of assistance, amount/quantity/frequency **only when verified**, relevant period and conditions. Differentiate grant, pension, loan, subsidy, service and in-kind support. |
| Who can apply | Person/family/child/couple/student/farmer/connection/other scheme subject; conditions and exclusions in plain language. Link controlling instrument. |
| Evidence | Required/conditional evidence and permitted alternatives for this scheme. Registry enrollment evidence is not automatically the scheme's full checklist. |
| Application | Online/assisted/offline channels, genuine owner destination, stages, application window/timezone, fee, decision authority and tracking route. |
| Family ID use | `Information only`, `Apply on department website`, or `Connected service`, according to actual approved capability. Explain which details may be reused. |
| Help | Scheme-specific office/support, grievances/appeal and accessible assistance. |
| Publication metadata | Owner/reviewer, last substantive verification, rule effective dates, source/order, translated version and archive state. |

Keep eligibility, evidence and applying accessible as ordinary headings with optional contents navigation. On mobile, do not hide all substantive details in nested accordions. PDF orders supplement accessible explanations. When versions conflict or freshness expires, suppress definitive personalized recommendations and direct the user to owner confirmation.

### 12.3 Gujarat starter content inventory

These are **real research examples**, not a declaration that Family ID integrates with them. Editors must obtain the operative rulebook and current service channels before publishing transactional claims. Each can be represented as `Information only` in design fixtures.

| Example | Verified owner/source and safe description | Frontend design lesson |
|---|---|---|
| Sant Surdas Yojana / સંત સુરદાસ યોજના | Social Defense page describes disability-related assistance and names e-Samaj Kalyan/assisted channels. [G14] | Person-specific evidence; show the responsible decision authority. Amounts and exact thresholds require dated content validation. |
| Mukhyamantri Matrushakti Yojana / મુખ્યમંત્રી માતૃશક્તિ યોજના | WCD's scheme page describes maternal/child nutrition and the 1000 Days portal/Anganwadi channel; page publication 6 February 2023. [G16] | In-kind nutrition is not a cash payment; sensitive health-related context is not public family-profile content. |
| Ganga Swarupa Pension / ગંગા સ્વરૂપા બહેનોને આર્થિક સહાય | WCD's 31 January 2023 page describes assistance to widowed women and Mamlatdar verification. [G17] | Respect sensitive circumstances; preserve application channel and published age of evidence. Do not hard-code an old amount from the page. |
| Vahali Dikari / વ્હાલી દીકરી યોજના | Listed on the current WCD homepage; the linked detail page timed out in this review. [G09] | Name/topic can guide research; exact eligibility/application claims remain unverified here. |
| Scholarship services | DST describes online scholarship access through Digital Gujarat; SJE supplies category-specific service information. [G04] [G02] | Named student, academic year and applicable individual certificate; household approval is not a scholarship award. |
| Ration-card services | DST lists these among Digital Gujarat services; FCS is a source-owner research target. [G04] [G12] | Family ID, ration-card record and food entitlement have separate states. |
| Agriculture/livelihood services via iKhedut | iKhedut is listed in the official government directory. [G11] [G13] | Verified destination only; specific active schemes, eligibility and Family ID integration need owner evidence. |

Do not populate production with fictional “Kutumb Setu cash assistance,” fabricated enrollment counts, unverified schemes, amounts, application dates or functioning Apply buttons for unfinished connectors.

### 12.4 Referral and application handoff

**FE-25:** Recommendation states: `May be relevant`, `More information needed`, `Already reported enrolled`, `Department review required`, or a dated owner-issued outcome. Explain the reason using only authorized information. “No result” means no current match in available information, not legal ineligibility.

For external application links, state destination/owner and what happens next. Avoid unnecessary confirmation modals; obtain explicit permission where personal information will be shared. A referral submits a minimum approved packet through the backend and creates a reference. An ordinary link click must never show `Application submitted`. Returning from an external site must not create a fake receipt or payment success.

### 12.5 C08 passbook

**FE-26:** Separate tabs/sections for recommendations, scheme applications, decisions and reported benefits. Filters include authorized person, scheme/department, period and status. Default to the signed-in person's permitted view; a family representative is not presumed to see every adult's benefits.

Each reported entry displays owner, scheme, named authorized subject, period, benefit type, actual reported state, event date, amount/quantity when permitted, last reported time and correction link. Model sanctioned, payment initiated, paid as reported, failed, reversed, in-kind issued, and corrected separately. An award without a payment report is not “paid.”

Empty messages distinguish no connected feed, no entries in selected period, not authorized, data delayed and service unavailable. Add a coverage statement: `This view contains reports from participating departments. A missing entry does not prove that a benefit was not received.` Show the actual departments/time coverage. Any total must identify period, unit, completeness and reversal treatment; never sum rupees with kilograms or count every delivery as a unique beneficiary.

**FE-27:** A benefit dispute goes to its source owner with the source transaction/reference. The portal tracks the case when supported; it cannot change the department's payment ledger through a family edit. No wallet, payment collection or bank-change facility is part of the default scope.

### 12.6 Scheme-specific household units and external subjects

An extended registry family is not automatically the assessment unit of every scheme. Where authorized, the private application/review view identifies the **assessed members**, **income/eligibility contributors**, assessment date/financial year, relationship evidence, rule version and unresolved gaps returned by the scheme service. A scheme may permit separate qualifying subfamilies within the same joint household. Do not combine all adults' income in the browser or label a second valid award as duplication. An unavailable relationship remains unresolved rather than being inferred from a surname or address. Only entitled actors see these details.

For a connected utility, land, agriculture, livestock or enterprise service, collect/display the owner's typed reference, relevant beneficiary role (for example occupant, tenant, cultivator or keeper), applicable dates and source status **inside that scheme's approved flow**. Do not make these universal enrollment fields or assume that family membership proves ownership. Support source correction and de-linking with review/receipt/status, including a move or changed connection, without deleting a person or renumbering the family.

Where approved benefit interactions exist, display the department's explanation of exclusivity, compatibility or top-up/offset, applicable period and decision reference. An existing pension is not universally a reason to hide another pension. Historical amounts remain tied to their effective period; a new rule must not silently relabel an old payment. These requirements implement companion FR-138–140 and related assessment/award requirements; they are conditional capabilities, not claims about an operational Gujarat connector.

## 13. Assisted-service and staff workspaces

### 13.1 Assisted intake

**FE-28:** Operators authenticate under their own credentials and initiate a scoped resident session. Display office/centre, resident task, authority basis and official fee schedule before data entry. A recorded resident acknowledgment is not replaced by an operator checking a generic “consent” box for everyone.

Use the same field policy and validation as self-service, with approved exception codes and evidence capture. The operator cannot bypass an obligatory review by selecting a different channel. Provide read-back/review in the resident's language, print the actual acknowledgment, show any authorized charge on a receipt, and end the resident session visibly. Do not retain the previous applicant in autocomplete, shared download previews or local draft lists visible to the next person.

No persistent offline storage of resident data in the ordinary public browser. If field/offline collection is approved, deliver a separately assessed managed-device mode: encrypted bounded storage, operator/device/time provenance, expiry, unsynced-state warning, conflict resolution and successful server receipt before calling a record submitted. A generic PWA checkbox does not satisfy these requirements.

### 13.2 Casework and decision screens

| Screen | Required information and actions |
|---|---|
| Assigned queue | Reference, task type, jurisdiction, state, age, actual due date, attention indicator and assignee role. Sort/filter/search scoped to permission; server pagination; preserve filters after returning from a case. |
| Case detail | Application history, only authorized member facts, source dates, submitted versus source values, evidence viewer and policy version. Keyboard-readable side-by-side comparison collapses to sequential sections on narrow screens. |
| Verification | Checklist with evidence-backed outcomes, request clarification, record authorized field-check result, recommend or escalate. Operator cannot claim source verification merely by opening a PDF. |
| Decision | Approve/reject/request information within authority; required reason, relevant scope and effective date; summary before high-impact decision; dual control where prescribed. |
| Supervisor | Aging, reassignment and exceptions with mandatory reason; no invisible queue manipulation. Escalation history remains auditable. |
| Source discrepancy | Source-versus-registry comparison, freshness, owner, linked cases, proposed resolution and propagation acknowledgments. No last-write-wins override through the UI. |
| Grievance/appeal | Independent assigned authority, protected details, original decision and permitted correspondence; reasoned resolution and appeal status. |
| Audit | Who accessed/changed/disclosed which permitted object, purpose/case and time; query scope and export requests themselves audited. |

**FE-29:** Staff can see only permitted facts for an assigned jurisdiction, role and case purpose. Displaying a button is not authorization; server checks are mandatory. Instruct the frontend to handle `forbidden`, stale role, expired delegation and record revision conflicts. Do not silently retry a decision against changed evidence.

**FE-30:** Staff errors and high-impact actions require reasons, confirmation and recoverable case history. Reject self-approval where segregation of duties applies. Bulk export, merge and exceptional overrides require separately approved workflows. Export jobs show requesting purpose, approved scope, progress, expiry and audit reference; no “Download all Gujarat families” action.

### 13.3 Role/disclosure matrix

The backend must return a minimized authorized view. This matrix is a proposed access boundary to refine under D-07/D-12/D-22/D-41.

| Actor | Normal visible scope | Must not be implied by that role |
|---|---|---|
| Public visitor | Published guides, schemes, notices and approved aggregates. | Person/family enumeration or private status. |
| Authenticated resident | Own authorized records and requests, permitted family summary. | Every other adult's caste, health, income, bank or benefit detail. |
| Representative/guardian | Explicit task/person scope under current authority. | Permanent unlimited household access. |
| Assisted operator | Current assisted case and required evidence. | Reusing citizen OTP/session; broad unrelated search or export. |
| Verifier/approver | Assigned/jurisdiction-scoped evidence and actions. | Editing source certificates or bypassing separation of duties. |
| Department user | Fields and cases for approved scheme/purpose. | A universal family profile from possession of an ID. |
| Content editor | Public content and preview. | Resident registry access or credential management. |
| Integration administrator | App metadata, scopes and operational health. | Unrestricted scheme-rule approval or resident browsing. |
| Analyst | Approved aggregates and suppressed data. | Person-level drilldown by caste/health/location. |
| Auditor | Approved audit scope, with controlled access to underlying cases. | Routine unrestricted sharing/export of logs. |

### 13.4 Operations, coverage and public statistics

S13 separates applications received/decided, active registered families/persons, unresolved matches, queue age, correction propagation, scheme leads, department applications, awards and reported deliveries. Each chart has an equivalent table, definition, period, geography, denominator, freshness and missing-feed warning. Distinguish unique people from cases and transactions. A registry enrollment count is **not Gujarat's census population**; an apparent reduction can reflect deduplication, scope or delayed reporting, not a measured population change.

Public P20 is disabled until aggregate-release rules and approved data exist. Suppress disclosive small cells and unsafe combinations of filters; backend enforcement must prevent reconstructing a hidden value through totals or repeated queries. Staff reports follow jurisdiction/purpose restrictions, and authorized exports retain coverage notes. No public caste, health or beneficiary lookup is created to make a dashboard more interactive. Compare digital/assisted and ration/non-ration journey failures only under approved privacy and evaluation rules.

## 14. Department and developer experience

### 14.1 Onboarding and documentation

**FE-31:** Department onboarding screens follow request → review of purpose/data needs → agreement → synthetic sandbox → conformance/security review → approval → activation → ongoing monitoring → suspension/offboarding. These are proposed process states, not evidence that a Gujarat gateway already exists.

Department request fields: owning organisation, accountable official role/contact, service/scheme and purpose, legal/administrative reference, requested operations/fields, person/family/other subject, expected volume, retention, grievance owner and technical contact. Upload agreements through a protected channel; do not collect credentials in a public contact form.

The developer portal must document authentication pattern, scopes, object access rules, versioning, pagination, idempotency, errors, limits, source freshness, event replay/deduplication, examples, change/deprecation dates and support. Use synthetic fixtures for ration/non-ration, split/transfer, unknown evidence, denied access and outages. Interactive API explorers default to the sandbox and must not embed production secrets in page source.

**FE-32:** Authenticated app-management screens show approved scopes, environment, expiry, owner, recent permitted usage and credential rotation/revocation. Provision secrets only through an approved secure mechanism; show-once disclosure if prescribed, with no analytics/URL capture. Public documentation and private operational configuration are different access classes.

### 14.2 Adding a scheme without rebuilding the citizen shell

**FE-33:** A controlled configuration supports standard scheme cards, detail pages, evidence lists, discovery categories, referral actions, department-reported states and benefit displays. A new scheme should reuse these layouts when its contract fits. A materially new legal transaction, data subject or evidence process still needs design/security review.

Scheme configuration includes owner, content locales, authoritative source, rule/effective version, recipient/assessment unit, approved fields, evidence, channels, active dates, display capability and connector status. Do not put eligibility computations in client JavaScript as the authoritative decision engine. A rule-editor preview executes only approved server-side logic against synthetic cases; it cannot authorize awards.

Separate **catalogue listed**, **connector approved**, **connector enabled**, **recommendations available**, **application handoff enabled**, **status reporting enabled**, and **benefit reporting enabled**. A single `integrated=true` flag cannot describe all these capabilities. Conditional buttons render from approved capabilities and actual availability; explanatory content remains accessible when a connector is unavailable.

## 15. Content operations and Gujarat localization

### 15.1 CMS models and publication lifecycle

**FE-34:** Editors manage public content through draft → translation → subject-owner review → accessibility/content check → approval → publication → scheduled review/expiry → archive. Keep versions and rollback; an edit to an English scheme rule must trigger Gujarati review before conflicting content is published.

| Content model | Fields beyond title/body |
|---|---|
| Service guide | Audience, scenario, prerequisites/alternatives, steps, fee, timescale, owner, support, evidence policy, effective date. |
| Scheme | Fields in §12.2, relationship to Mari Yojana/department source, exact capability flags and next verification date. |
| FAQ | Topic, plain question/answer, relevant service, rule reference, locale and reviewed date. |
| Notice/outage | Severity, affected services/areas, action, alternative, published/start/end dates and owner. |
| Document/order | Owner, number, publication/effective/replacement dates, locale, actual file type/size, accessible equivalent. |
| Centre/office/contact | Authoritative location codes, address, verified channels/hours, supported services, accessibility arrangements, fee reference, review date. |
| Official/brand asset | Approved lockup/person/role, source/permission, alt text, display scope, verified date, expiry. |
| Policy | Accountable owner, applicable service scope, effective/version date, translations and change history. |
| Notification template | Event, channel, approved minimal fields, language, essential/optional classification, safe-contact rules, owner and version; test previews contain synthetic data only. |

Sanitize rich content and restrict scripts/iframes. Broken external links, expiring schemes, stale help contacts, untranslated changes and missing alt text appear in an editorial queue. A page's reviewed date changes after a real review, not every deployment. Track private operational policy versions without publishing sensitive configuration.

### 15.2 Gujarati and English

**FE-35:** Provide complete Gujarati and English journeys, including validation, OTP guidance, emails/SMS where supported, receipts, PDF titles, policy notices, accessibility labels and staff-facing resident messages. Gujarati is the proposed initial default; preserve the user's explicit selection and never switch language because an external API returned English.

Use stable message keys with pluralization/parameters rather than concatenated translated fragments. Set `lang=gu` or `lang=en` and mark mixed-language passages. Gujarati and English are left-to-right. Support Unicode without stripping combining marks or destructively normalizing names. Original source spelling and optional display transliteration remain separately reviewable.

Accept Gujarati digits in ordinary numeric/date input where feasible and normalize them to the contract format transparently; identifiers remain strings with leading zeros. Display identifier characters consistently for copy/print and explain the expected format. Render dates unambiguously, such as `20 Sep 2026, 1:30 PM IST`, and localize labels. Date-only birth/effective dates must not shift because of timezone conversion.

Hindi is a tracked coverage decision, not falsely promised as available. Human-reviewed Gujarati is required for notices, consent/authority, errors and scheme conditions. Runtime machine translation of personal data to an external service is outside the default hosting and privacy scope.

### 15.3 Draft bilingual terminology

These strings are proposed copy, not legally approved Gujarati. A native-language editor and resident usability testing must finalize them.

| English | Gujarati draft |
|---|---|
| Government of Gujarat | ગુજરાત સરકાર |
| Family services | પરિવાર સેવાઓ |
| Find my Family ID | મારી પરિવાર ઓળખ શોધો |
| Apply for Family ID | પરિવાર ઓળખ માટે અરજી કરો |
| Track application | અરજીની સ્થિતિ જુઓ |
| Continue saved application | સાચવેલી અરજી આગળ ભરો |
| Request a correction | સુધારા માટે વિનંતી કરો |
| Find schemes | યોજનાઓ શોધો |
| Find an assistance centre | સહાય કેન્દ્ર શોધો |
| I do not have a ration card | મારી પાસે રેશન કાર્ડ નથી |
| I am not sure | મને ખાતરી નથી |
| Save and continue | સાચવો અને આગળ વધો |
| Save and exit | સાચવો અને બહાર નીકળો |
| Review your details | તમારી વિગતો ચકાસો |
| Submit application | અરજી મોકલો |
| Draft — not submitted | ડ્રાફ્ટ — અરજી મોકલેલી નથી |
| Application received | અરજી મળી ગઈ છે |
| More information needed | વધુ માહિતી જરૂરી છે |
| Under verification | ચકાસણી હેઠળ |
| Request approved | વિનંતી મંજૂર થઈ છે |
| Change implemented | સુધારો અમલમાં આવ્યો છે |
| Report a problem | સમસ્યા જણાવો |
| Help and contact | મદદ અને સંપર્ક |

Error copy must identify the problem and remedy without blaming the resident. Example: `Your application has not been submitted. Check the marked fields.` / `તમારી અરજી મોકલાઈ નથી. દર્શાવેલી વિગતો ચકાસો.` For network loss: `We could not save the latest change. Keep this page open and try again.` Never say “saved” unless acknowledged. Use one consistent approved glossary for family/person/member/reference/ID/benefit; explain technical terms on first use.

## 16. Accessibility acceptance specification

Accessibility is part of every screen, staff interface, document and embedded connector. The following are implementation checks toward the full WCAG 2.2 AA target, not a replacement for evaluating all applicable success criteria. Standards-based thresholds are distinguished from stronger project choices. [N03]

| ID | Testable behavior | Basis |
|---|---|---|
| AX-01 | Entire core journey works by keyboard with logical order, visible focus, no traps, skip links and correct landmarks/headings. | WCAG keyboard/navigation; project-wide acceptance. [N03] |
| AX-02 | Ordinary text contrast ≥4.5:1; WCAG-defined large text ≥3:1; meaningful controls/focus meet applicable nontext contrast requirements. Never encode state only in colour. | Contrast requirements. [A02] [N03] |
| AX-03 | At 200% text size and 320 CSS px reflow/400% zoom, nonexcepted content remains usable without two-dimensional scrolling. Test portrait and landscape. | Reflow and resize. [A03] |
| AX-04 | Labels/fieldset legends, instructions, required status and errors are programmatically associated; errors are identified in text. Submit focuses a linked error summary while preserving correct values. | Error identification; implementation pattern proposed. [A04] |
| AX-05 | Loading, saved state, result count and submission outcomes are announced appropriately without moving focus unexpectedly or continuously interrupting typing. | Status messages. [A05] |
| AX-06 | Focused controls are not entirely hidden by sticky header/footer/help widgets. Aim to keep the whole target visible. | WCAG 2.2 focus requirement; stronger project usability target. [A06] |
| AX-07 | Target-size floor follows WCAG 2.2's 24×24 CSS px rule or allowed exceptions; the product normally uses ≥44×44 and 48px form controls. | Minimum standard versus proposed larger targets. [A07] |
| AX-08 | Authentication permits paste/autofill and appropriate assistance; memory/puzzle tasks have a conforming alternative. Session warning/recovery works with assistive technology. | Accessible authentication. [A01] |
| AX-09 | Dialogs have accessible name, entry focus, contained keyboard interaction where modal, Escape/close and focus return. Avoid modal announcements at initial load. | Project interaction contract; WAI modal-dialog pattern. [A08] |
| AX-10 | Charts have equivalent text/tables; uploads are not drag-only; trees have list alternatives; icons have meaningful names or are hidden when decorative. | Project multimodal acceptance. |
| AX-11 | PDFs have tags, logical reading order, actual text, headings, language and appropriate table structure; provide usable HTML. Gujarati glyphs survive export. | Project document acceptance supporting GIGW/WCAG. |
| AX-12 | Videos have necessary captions/transcript/audio-description alternatives; no autoplay audio, flashing or required motion. | Applicable WCAG media criteria. [N03] |
| AX-13 | Language switches preserve task and data; translated controls retain discernible names; native Gujarati readers validate pronunciation/wording with supported screen-reader setups. | Project localization/accessibility acceptance. |
| AX-14 | Help remains in a consistent location; avoid repeated data entry already validly supplied; accessible alternatives exist for dragging and authentication. | Include WCAG 2.2 new criteria in full audit. [N03] |

Test representative complete paths with NVDA + Firefox/Chrome, Android TalkBack + Chrome and iOS VoiceOver + Safari, plus keyboard-only, zoom, forced-colours/high-contrast and reduced-motion settings. Lock browser/OS/assistive-technology versions in the test report; test the actual Gujarati voice/font combination rather than assuming support. Automated checks complement manual task testing.

Proposed accessibility preferences: text scaling, contrast theme, link emphasis and reset. They must not modify canonical content, obscure controls or become essential for baseline compliance. A screen-reader-help page explains built-in compatibility and support; it does not ask a disabled user to download a particular reader before proceeding. Hosting an accessibility widget is optional; if selected it is assessed and self-hosted under the same dependency policy.

Calculated contrast for the proposed solid pairs: white/`#162F6A` **12.74:1**, white/`#214AAB` **7.98:1**, body/white **14.68:1**, muted/white **7.56:1**, success pair **6.12:1**, warning **6.37:1**, error **6.05:1**. White on `#5279D7` is **4.14:1** and fails ordinary-text AA; do not use that combination for small labels. These calculations validate token pairs, not the rendered application's complete accessibility.

## 17. Shared components and state completeness

**FE-36:** Design and document every component in Gujarati/English at mobile/desktop widths, keyboard focus and error states. Reuse semantic native controls where suitable. Evaluate UX4G patterns for reuse, but do not inherit unwanted external scripts or untested runtime behavior. [N06]

| Component group | Required variants/states |
|---|---|
| Identity/shell | Public, resident, assisted, staff, partner; long department name, no portrait, pilot banner, small viewport. |
| Navigation | Current page, breadcrumb, mobile menu, language switch, pagination, back-to-task. |
| Service/scheme card | Available, information only, department handoff, closed window, temporary outage; no inert “Apply” link. |
| Forms | Text/phone/date, selection/radio/checkbox, conditional field, source-prefilled field, address dependency and member repeater. |
| Evidence | Empty, reused, uploading, scanning, accepted, unreadable, rejected, expired, revoked and retry. |
| Feedback | Inline helper/error, error summary, notice, status tag, pending response and dismissible information with accessible announcement. |
| Task history | Stepper, dated timeline, source badge, old/new comparison, decision reason and implementation acknowledgment. |
| Data view | Small-screen summary/list, staff table, filter controls, sortable header, stable pagination and aggregate chart/table pair. |
| Safety/continuity | Session warning, confirmation, conflict resolution, unsaved changes, source outage and ambiguous submission. |
| Output | Receipt, family document, printable service guide and accessible download metadata. |

Every asynchronous screen must cover initial loading, success with data, success with no data, partial/stale data, validation failure, rate limit, forbidden, session expiry, dependency outage, unexpected server error, lost connection and retry. “No record found” is shown only after an authorized completed check. Unknown values remain unknown; do not render them as zero income, no disability, unreserved category or no benefits.

## 18. Frontend architecture, privacy and initial hosting

### 18.1 Hosting contract

**FE-37:** Launch on government-approved, controlled infrastructure under the user's initial hosting constraint. Build static assets and any server renderer/CMS on that infrastructure. No required SaaS deployment platform, third-party CDN, hosted database, commercial analytics, remote font, image proxy or remote translation call is part of the default product. Open-source packages can be reviewed and bundled; a library dependency does not require its publisher's server at runtime.

Public static content can be prerendered or rendered on the controlled server; public navigation/help remain meaningful when JavaScript fails. Authenticated workflows may require JavaScript but must show an accessible failure/help page if it cannot load. Avoid putting the whole public website behind client-side loading and login.

Use a shared design system, localized content model and typed API adapter layer. Organize features by service domain: access, enrollment, family, changes, schemes, passbook, redress, assisted, casework, publishing and department onboarding. Keep routing/view state separate from canonical server records and policy versions. The implementation framework is an engineering choice; this specification does not assume an existing React/Angular/Vue repository or prescribe an unverified package version.

An eventual AWS migration must preserve public domain/routes, identity references, API contracts, accessibility and data controls. Hosting-specific URLs and storage paths remain behind adapters/configuration. Rehearse cache invalidation, source integration connectivity, document links and session handling in the migration plan. The frontend alone cannot prove statewide backend capacity or approve a cloud move.

### 18.2 External services and privacy

**FE-38:** Maintain a runtime network allowlist. Normal browsing should contact only approved controlled origins. Any necessary government identity/SMS/document connector must be separately authorized and normally reached through backend services. A link to another official website is not the same as loading its scripts, pixels, fonts, video or map on the resident's page.

Use static/link alternatives for external media/maps, and host approved essential instructional content locally. Do not load social widgets or third-party session replay. No browser-side secrets or direct database connections. Safe-error pages expose a correlation reference and support route, not stack traces, tokens or private request content.

**FE-39:** Public content and private records have distinct caching rules. Versioned public assets can be cached; personalized HTML/API/documents require explicit protective headers and must be excluded from shared caches/service-worker storage. Test logout, Back navigation, browser restore and another-user login for stale data. A cookie alone does not prevent shared-cache disclosure. [T01]

**FE-40:** Default sensitive form state lives in memory with authorized server-side drafts. Do not persist authentication secrets or resident profiles in `localStorage`, `sessionStorage`, public cache or browser analytics. Restrict browser storage to non-sensitive preferences where appropriate. Browser storage is accessible to same-origin scripts and is not a secure identity vault. [T02]

Session implementation must use an approved secure server-side pattern, CSRF protection where applicable, secure cookies, content sanitization and tested injection defenses. A restrictive Content Security Policy is defense in depth; it does not replace safe coding. Resolve approved external identity flows explicitly rather than allowing arbitrary frames/scripts. [T03]

Mask sensitive values by default, but also minimize API payloads and enforce server object authorization. Redact logs, telemetry, crash reports, filenames, page titles and export names. No Aadhaar/phone/bank/certificate search terms in public analytics. Keep screenshots/test fixtures synthetic and access-controlled.

### 18.3 Policy/version and concurrency behavior

**FE-41:** Store the policy/schema version and record revision with a draft. If policy changes, explain any new requirement and preserve previous input; do not silently invalidate submitted cases. Server revision conflict returns a comparison/reload path. Never overwrite a newer correction simply because an older browser tab submits later.

Feature flags represent approved rollout/capabilities, not client-enforced security. Maintain separate flags for self-service enrollment, PDS prefill, approved identity method, particular life-event operations, scheme referral and benefit reporting. Turning off a transaction must leave useful guidance and case tracking available where safe. Do not present hidden/unapproved features as already operational.

## 19. Frontend-facing service contracts

The table specifies **information the frontend needs**, not final HTTP endpoints or database tables. Backend/API owners must agree request/response schemas before integration development. Client validation is for usability; the server repeats authoritative validation and authorization.

| Contract | Minimum returned information | Required exceptions |
|---|---|---|
| Public configuration/content | Branding asset versions, locales, approved features, guides, contacts, fee/timing notices, effective/review dates. | Missing locale, unpublished content, expired notice, stale/disabled capability. |
| Session and access | Actor type, permitted acting subject, authorized capabilities, expiry and step-up requirements. | Unauthenticated, denied, expired, revoked delegation, approved alternative route. |
| Challenge | Opaque challenge reference, masked destination, verification purpose, expiry/resend/retry policy. | Invalid/expired/limited, dependency unavailable; no account-enumerating details. |
| Existing-record check | Authorized match category, minimum allowed summary, source time and next action/case reference. | No match, ambiguous, dispute, stale source, source outage. |
| Form policy | Version, scenario, field groups, conditional requiredness, code lists, evidence/alternatives, notices and applicability date. | Unsupported scenario/version; policy changed during draft. |
| Draft read/save | Opaque draft reference, revision, data in scope, saved timestamp, current step, expiry and field errors. | Conflict, expired retention, not authorized, network ambiguity. |
| Submit | Submission-intent/idempotency reference, durable receipt, current state, next step and follow-up link. | Validation, duplicate intent, existing linked case, uncertain response reconciled by intent. |
| Status/timeline | Type/reference, state, reason, office, required action, source freshness, event timestamps and actual deadline when applicable. | Protected/not found response policy, rate limit, delayed source, revoked scope. |
| Family/member read | Minimal authorized facts, per-fact source/verification/effective date, current membership/representative and permitted actions. | Restricted facts omitted, not merely masked; pending/disputed/source conflict. |
| Change request | Affected objects, permitted comparison, proposed/effective dates, evidence, revision, decision and implementation states. | Competing membership claim, source ownership, conflict, prohibited event. |
| Document service | Authorized download/verification intent, metadata, language, version and short-lived access method. | Pending rendering, revoked/expired link, forbidden, replaced document. |
| Scheme catalogue | Localized approved content, sources/rules, dates, application channels, discovery taxonomy and exact capability flags. | Closed, retired, stale, missing translation, unavailable catalogue. |
| Discovery/referral | Dated recommendation reason/evidence completeness; actual referral reference if submitted. | Unknown facts, conflicting rules, owner unavailable, consent/authority missing. |
| Benefit report | Authorized subject, owner/scheme, event/reference, status, period, permitted units/amounts, freshness and coverage. | Partial feed, not authorized, no entries, reversal/correction, outage. |
| Grievance/appeal | Reference, category, responsible authority, safe correspondence, status and remedy. | Unsupported jurisdiction, restricted reporter, attachment rejection, linked case. |
| Staff task/decision | Assignment, jurisdiction/purpose, evidence/revisions, permitted actions and decision conditions. | Stale assignment, self-approval blocked, conflict, additional approval required. |
| Integration management | App/owner/scope/environment, review state, conformance results and health/freshness. | Revoked/expired credential, disallowed scope, suspended integration. |
| Aggregate reports | Approved measure/denominator, period, coverage, definition, suppression and update time. | Suppressed/unavailable values remain explicit; no leaked small-cell totals. |

Common contract conventions: stable opaque identifiers as strings; machine-readable status/error code plus localized message key and safe parameters; field errors by field path; UTC event times with local display; separate date-only values; policy/record versions; source ownership; nullable/unknown semantics; permitted-next-actions; correlation reference; bounded pagination; retry hints. Define money as a precise amount with currency and explicit units for in-kind benefits; do not rely on floating-point display assumptions.

**FE-42:** Test UI adapters against representative successful and failing contracts before backend completion. Use a mock adapter with the same schemas and a visible development marker. Production builds cannot silently fall back to synthetic families, approval decisions, benefit entries or fake OTP success.

## 20. Measurable frontend nonfunctional requirements

All engineering numbers below are **proposed acceptance targets**, to baseline against representative devices, connectivity, government infrastructure and actual demand. They are not measured results of a built frontend.

| ID | Target and measurement |
|---|---|
| FE-NFR-01 | Meet the full approved accessibility scope in §16, with no unresolved blocking accessibility defects on core tasks; record manual as well as automated evidence. |
| FE-NFR-02 | All required public/resident journeys and critical messages have approved Gujarati/English parity; no untranslated message keys or clipped Gujarati in acceptance fixtures. |
| FE-NFR-03 | Proposed field targets at p75: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1, evaluated separately for mobile and desktop when sufficient real usage exists. These are Web Vitals thresholds, not a guarantee on every connection. [T04] |
| FE-NFR-04 | Prelaunch repeatable lab profile: 360px viewport, 4× CPU slowdown, approximately 1.6Mbps down/750Kbps up and 150ms RTT; initial public task content usable within 5s target. Also test at least one real low-end Android device agreed for pilot. Record cold/warm cache and run variability. |
| FE-NFR-05 | Proposed first-load budgets: public/home transfer ≤800KB including required fonts/images/scripts; initial compressed JS ≤200KB. Authenticated first task ≤1MB excluding requested documents. Budget per locale and lazy-load nonessential modules; exceptions require measured justification. |
| FE-NFR-06 | Backend lookup/submission objectives remain companion NFR-03 proposals, with external delays separately measured. UI shows genuine pending state and recovery; local click/loading feedback should appear within 100ms in the agreed lab profile. |
| FE-NFR-07 | Every write supports safe duplicate-click, timeout/retry and lost-response reconciliation. Test concurrent tabs and stale revisions with no duplicate enrollment or overwritten accepted change. |
| FE-NFR-08 | Server-saved drafts survive reauthentication/recoverable network loss within approved retention. Latest-unsaved changes are clearly marked. Test browser refresh, closed tab and reconnect at every step. |
| FE-NFR-09 | No personal information in public page source, shared caches, telemetry or URLs. Automated payload/log assertions plus manual cross-account checks demonstrate the boundary. |
| FE-NFR-10 | Test the agreed supported current browser/OS matrix and one prior supported major version where practicable. Update it at launch; do not advertise IE or a fixed 1366×768 resolution as a requirement. |
| FE-NFR-11 | Public guidance remains available during noncritical scheme/feed outages; private cards show dated partial/unavailable states. Core availability follows separately negotiated system SLOs, not a frontend-only promise. |
| FE-NFR-12 | Normal page loading makes no unapproved external runtime requests. Validate with network capture for each shell, locale and connector entry/exit. |
| FE-NFR-13 | All public notices, scheme pages, contacts and policy content have owner/review metadata; expired/withdrawn content has safe archive/redirect behavior and no active misleading Apply button. |
| FE-NFR-14 | Private lists/queues use bounded server pagination; the browser never downloads the statewide registry. Report exports are scoped asynchronous jobs where approved. |
| FE-NFR-15 | Reproducible locked builds, approved dependency/licenses, release provenance, asset versioning and rollback; emergency content/config changes remain reviewable. |
| FE-NFR-16 | Privacy-safe monitoring records journey stage, error code, latency, dependency state and correlation IDs under approved retention. No session replay or sensitive form capture. |
| FE-NFR-17 | Print/PDF testing covers Gujarati/English, long names, large families, page breaks, grayscale and assistive reading; every submitted task can produce its actual receipt. |
| FE-NFR-18 | A new standard catalogue scheme can be published through reviewed configuration, tested against closed/stale/missing-data states, without rebuilding family identity screens. Novel workflows undergo normal review. |

Measure task completion, assistance needed, repeated visits, submission failure/recovery, time to find help and wrong-route selection by language/device/channel where privacy allows. Do not claim usability success from page views alone. Proposed pilot goal: at least 90% unassisted completion for core digital tasks among recruited participants who can use that channel, with all others able to reach assistance. Report sample size and uncertainty; do not generalize a small test to Gujarat's population.

## 21. Design handoff, verification and release gates

### 21.1 Required design/developer package

This specification is the input to the following deliverables; it does not claim they already exist:

1. Approved IA and clickable core-journey prototypes in Gujarati and English, with desktop, 360px mobile and 320px reflow examples. Cover every route in §5 or explicitly mark it policy-gated/out of a release; no unexplained dead navigation.
2. Component catalogue with tokens, semantics, keyboard behavior, responsive behavior, long-content fixtures and all §17 states. Include plain HTML/print receipts as well as visual screen designs.
3. Versioned field/evidence dictionary approved per scenario, and localized content inventory with source, owner, effective/review date and sign-off. Translation review includes scheme terminology and privacy notices, not only headings.
4. Typed frontend contract fixtures for §19, including authorization failures, delayed feeds, reconciliation and concurrency. Mock/synthetic mode must be visibly distinct from production.
5. Role-based end-to-end tests, unit/component tests for validation and state mapping, API-contract tests, accessibility reports, performance budgets, security/network checks and content/link verification.
6. Operating guides for publishers, assistance staff, integration owners and support. Include incident/service-notice publication, content correction, connector outage, emergency rollback, stale-official-person removal and review reminders.

Use synthetic people, documents, identifiers and scheme transactions throughout design and test. Do not use real resident data copied from screenshots or government databases. Mark fictional names/references as test data, and do not create plausible government orders, approvals or cash benefits as if they were real.

### 21.2 Acceptance scenarios

`AT` identifies proposed acceptance tests. **None is reported as passed**: this task produces research/documentation, not a running application. Execute each applicable scenario in both supported languages and relevant self/assisted channels. Test protected flows with at least two unrelated resident identities and different staff scopes.

| ID | Scenario and required outcome |
|---|---|
| AT-01 | New visitor on mobile finds apply, find ID, track, correction, schemes and assistance; each destination explains prerequisites, owner, fee and next step before protected data collection. |
| AT-02 | Visitor switches Gujarati/English mid-task: route, entered values, focus context and draft survive; labels, errors and receipts change consistently without altering source-script personal names. |
| AT-03 | A permitted PDS match returns only the authorized summary and a confirmation/correction route; it does not create a second family or declare food entitlement. |
| AT-04 | No card, unknown card, suspended/wrong card and unavailable PDS source each offer the correct separate route; none silently becomes “no family exists.” |
| AT-05 | Two authorized adults share a phone; access challenges remain subject/task scoped and cannot disclose each other's restricted records. A no-personal-phone resident can obtain approved assistance. |
| AT-06 | Lost/changed phone or contested representative: ordinary OTP failure offers the approved recovery/review path. Knowing a Family ID/reference alone reveals no private details. |
| AT-07 | A single-person family, newborn with guardian, long Gujarati name, missing surname, living-away member and permitted age estimate can be represented without fabricated values. |
| AT-08 | Conditional identity/certificate/bank fields appear only for an approved scenario; declining optional outreach does not block enrollment, and an unavailable identity method shows the approved alternative. |
| AT-09 | Save, refresh, leave, reauthenticate and reconnect: only server-confirmed fields are marked saved; submitted and draft records remain visibly distinct and cannot leak to the next shared-device user. |
| AT-10 | Wrong type, oversized file, interrupted upload, scan pending/rejected and accepted evidence each produce accurate accessible states and a recovery path; navigation does not demand unnecessary reupload. |
| AT-11 | Final review supports targeted editing; duplicate clicks and a lost submission response reconcile to one real submission/receipt, not duplicate families or a fabricated success page. |
| AT-12 | A change is approved but source/registry propagation is pending: display both states and owner; current certified fact is unchanged until implementation is acknowledged. Rejection/appeal remains traceable. |
| AT-13 | Receipt/card prints in Gujarati/English, grayscale and a multi-page large-family case; authorized download links expire safely and QR/default output excludes restricted facts. |
| AT-14 | Birth/death/separation/transfer/split requests preserve stable identity and dated history. Late, repeated and disputed notices create reviewable cases rather than irreversible benefit termination. |
| AT-15 | A source-owned name/category/income fact is disputed: the registry offers the actual source correction route, preserves provenance and does not overwrite a certificate through a family edit. |
| AT-16 | Mixed-category family, expired/revoked certificate, state-versus-central list mismatch and unknown category: no household-wide inheritance or default negative final eligibility; unrelated tasks remain usable. |
| AT-17 | Suspected duplicate or overlapping membership receives safe review and contest guidance; no automatic merge, spouse relocation or public exposure of another family's full record. |
| AT-18 | Scheme search supports Gujarati/English queries, relevant synonyms, reset, return navigation and zero-results help. Catalogue outage is distinguished from zero matching schemes. |
| AT-19 | Scheme page displays its verified owner, source/date, subject, benefit type, evidence and actual channel. Closed, stale and information-only entries do not show a working internal Apply action. |
| AT-20 | Clicking an external application link creates no false application receipt. An accepted connected referral has its own reference; recommendation, application, award and delivery remain distinct. |
| AT-21 | Joint household with two permitted subfamilies and different contributor sets: UI shows the scheme's dated assessment scope; missing relationships stay unresolved and a valid second award is not automatically blocked. |
| AT-22 | Utility/asset-linked scheme supports typed owner reference, role, source dispute and approved de-linking without implying land title or altering the Family ID. Unauthorized linked subjects are absent. |
| AT-23 | Authorized passbook shows paid-as-reported, failed, reversed, corrected and in-kind entries accurately; missing/delayed feeds display coverage warnings. Totals use coherent units/periods and exclude duplication. |
| AT-24 | Adult, representative and guardian views follow their distinct permissions. Changing a URL/subject filter or using an expired delegation cannot retrieve another adult's benefit/certificate details. |
| AT-25 | Grievance without permanent ID, case appeal, fee/misconduct report and privacy complaint reach the right route; accused operators cannot suppress the complaint or access protected reporter details. |
| AT-26 | Assisted operator sees own identity and current resident authority, uses the same policy, provides reviewed receipt/approved fee information and ends the session without residual data. |
| AT-27 | Staff assignment expires or evidence revision changes before decision: server rejects stale/unauthorized action and UI preserves a safe comparison/reload path. Required segregation blocks self-approval. |
| AT-28 | Supervisor override, reassignment and export require appropriate reasons/authority and auditable references; content editor and integration admin cannot acquire resident powers through navigation or flags. |
| AT-29 | Department onboarding requests only declared purpose/scope; sandbox uses synthetic data. Revoked/expired credentials and missing scope show safe states with no secrets in page source or logs. |
| AT-30 | Publish a standard new scheme through approved configuration with translation, review and capability flags; no rebuild of family identity screens. Preview cannot issue real awards or bypass owner approval. |
| AT-31 | Change/expire a notice, official portrait or scheme version: approval, archive/redirect and cache invalidation work; conflicting translations or unreviewed rule changes cannot publish as current facts. |
| AT-32 | Report tables/charts distinguish registry coverage from census population and applications from payments. Suppressed small cells cannot be recovered through permitted filters or exported detail. |
| AT-33 | Complete core journeys using keyboard and agreed screen readers; labels, landmarks, errors, status updates, dialogs and focus return work. Authentication permits supported assistive/password-manager behavior. |
| AT-34 | At 320px, 200% text zoom and 400% browser zoom/reflow profile, essential content and actions remain usable; long Gujarati text and sticky elements do not obscure fields or focus. |
| AT-35 | Low-bandwidth/slow-device tests meet agreed budgets; public core guidance works if JavaScript or nonessential media fails, and retries preserve state without duplicate submission. |
| AT-36 | Logout, Back, browser restore, shared cache and service-worker checks expose no previous resident data. Personal information is absent from URLs, logs, telemetry and unapproved browser storage. |
| AT-37 | Network inspection finds no unapproved external fonts, scripts, video/map calls, analytics or secrets; protected endpoints are not publicly cacheable and production cannot fall back to mock success. |
| AT-38 | Maintenance, PDS/certificate/benefit outage, 429 rate limit, session expiry and unknown future status show distinct accurate messages and safe next actions; unknown is never rendered as rejected/approved. |
| AT-39 | Concurrent tabs and a form/rule change preserve approved historical state, detect revision conflict and explain required revalidation; new policy does not silently rewrite a submitted request. |
| AT-40 | Case milestones, resident notices, permitted access history and downstream acknowledgment agree on reference/time/state; a notification omits sensitive details and an unsafe former representative is not contacted automatically. |
| AT-41 | Where offline field mode is approved, device expiry, loss, interrupted sync and conflict are tested; an unsynced form is not labeled submitted and a stale record never overwrites a newer verified fact. |
| AT-42 | Approved pension compatibility/top-up and historical rate changes display owner decisions and relevant periods; they neither invent arrears nor recalculate a past award in browser code. |

### 21.3 Research with actual users and go-live sequence

The personas in §4 are hypotheses, not demographic survey findings. Recruit through approved channels across rural/urban settings, Gujarati-dominant and English users, low digital confidence, low-end/shared phones, older people, disabled users, non-ration residents and assisted-service staff. Avoid asking participants to bring real Aadhaar/certificate/bank data; use synthetic scenarios. Obtain appropriate participation arrangements and document task failure, comprehension, wrong turns, recovery and assistance, not just preference for colours.

Recommended gates:

| Gate | Required evidence and accountable sign-off |
|---|---|
| Policy/content baseline | Nodal department approves dependent §22 decisions, identity/evidence rules, authority boundaries, legal notices and service wording. Unapproved capabilities stay disabled and are not advertised. |
| Interaction validation | Service-design owner demonstrates core prototypes with residents/operators, resolves blocking language/navigation issues and signs off accessibility patterns. |
| Integration readiness | Each data owner accepts schemas, authorization, freshness, recovery and subject-specific tests. A directory link is not evidence of a connected transaction. |
| Quality/security readiness | Engineering/QA/security record accessibility, privacy, cross-account, performance, network and release tests; required government assurance/certification is complete. |
| Controlled pilot | Government chooses geography/channels, support capacity and evidence thresholds. Observe completion, exclusions, queue age and error recovery with privacy-safe measures; fix major issues before expansion. |
| Statewide release | Accountable owner signs operational readiness, capacity/DR evidence from the system workstream, monitoring/escalation, content ownership, rollback and public communication. |

A route listed here is not automatically a launch commitment. Publish an explicit release scope separating essential registry journeys, signed pilot connectors and later conditional capabilities. Do not let a phased release conceal missing recovery, accessibility, grievance or source-ownership controls for the features that do launch.

## 22. Frontend decisions requiring government/owner approval

The following is a **frontend dependency register**, not a replacement for D-01–46. Documentation and synthetic prototyping can proceed; affected production flows cannot be finalized by guessing the answers. Each decision needs owner, accepted answer, effective date, evidence and review date.

| ID | Decision/output required | Suggested accountable role; companion dependency |
|---|---|---|
| FD-01 | Confirm nodal department, mandate, official programme name, Gujarati wording, approved domain, emblem/wordmark, office-bearer treatment and actual hosting/development credits. | State programme/communications owner; D-01, D-14. |
| FD-02 | Approve family/resident/representative definitions, vulnerable-case handling, supported life events and launch operations. | Programme/legal/service owners; D-02–03, D-07–08, D-38, D-40. |
| FD-03 | Confirm public Family ID format, PDS alias/preseed policy, search/matching/recovery rights and treatment of replaced/wrong/missing cards. | Registry and FCS owners; D-04–05, D-26, D-28. |
| FD-04 | Approve identity/authentication methods, changed/shared/no-phone alternatives, session assurance, guardian/delegation scope and per-adult disclosure. | Identity/security/privacy owners; D-06–07, D-12, D-41. |
| FD-05 | Sign scenario-specific field dictionary, evidence/exception rules, upload limits, draft retention, requiredness and intake notice. | Programme/legal/data owners; D-09–10, D-13, D-18, D-23, D-27. |
| FD-06 | Confirm certified-fact owners, list versions, correction/referral interfaces, appeals and continuity during disputed/expired evidence. | Certificate/scheme owners; D-17–25. |
| FD-07 | Supply verified helpline/hours, centre directory, supported languages/access needs, official fees, receipts, time targets, escalation and misconduct handling. | Operations/grievance owner; D-08, D-15, D-39. |
| FD-08 | Approve Gujarati/English default and parity, any Hindi addition, official names/translations and ongoing bilingual publishing responsibility. | State communications/operations; D-15. |
| FD-09 | Decide relationship with Mari Yojana/Digital Gujarat: catalogue ownership, SSO if authorized, links versus APIs, pilot scheme list, publishing/review and stale-content handling. | Programme, portal and scheme owners; D-11, D-29, D-32. |
| FD-10 | Specify scheme subject/contributor sets, income periods, proactive authority, automated-action limits, award interactions and contest rules. | Each rule-owning department; D-30–31, D-35, D-42, D-45–46. |
| FD-11 | Approve passbook feeds/coverage/history, viewer rights, safe payment fields, correction owner and meaning of each reported status. | Scheme/payment/privacy owners; D-12, D-33–34, D-41. |
| FD-12 | Confirm any utility/asset/enterprise subject, typed reference, beneficiary role, proof, de-linking and dispute scope. | Relevant source/scheme owner; D-44. |
| FD-13 | Approve roles/jurisdictions, staff authentication, queue assignment, dual-control actions, audit/export policy and retention. | Operations/security/privacy; D-08, D-12–13, D-39–40. |
| FD-14 | Approve initial controlled infrastructure, government connectors, runtime allowlist, support/monitoring tooling, future AWS boundary and migration authority. | Government infrastructure/security; D-14. |
| FD-15 | Agree device/browser profiles, traffic model, frontend budgets, system SLOs, queue/freshness targets, accessibility assurance and pilot success measures. | Engineering, accessibility and departmental service owners; D-16, D-37. |
| FD-16 | Decide whether field/offline mode is needed, its managed-device controls and whether any location capture is lawful/necessary. | Programme/field operations/privacy; D-36. |
| FD-17 | Approve aggregate definitions, publication/suppression, permitted segmentation and treatment of coverage versus population statistics. | Statistics/privacy/programme owner; D-12, D-37. |
| FD-18 | Obtain missing Excalidraw/images and inaccessible comparator documents if they are to justify additional requirements; arrange authorized Gujarat portal demos and validate all active outbound URLs before launch. | Research/integration/content owners; D-43. |

No dependency is resolved merely because another state asks for that field or displays that logo. Every collection/use should have an explicit Gujarat purpose and owner; any formal legal interpretation belongs to the authorized government legal team.

## 23. Traceability to the existing requirements

### 23.1 Functional coverage

This grouped mapping covers the companion's complete FR identifier range. It maps **design responsibility**, not implementation/test completion. Preserve the companion's mandatory/conditional priorities. During sprint planning, expand each row into per-requirement tickets with exact acceptance assertions and linked policy decisions.

| Companion range | Frontend specification and screens | Representative tests |
|---|---|---|
| FR-01–13 | Public service guides, protected lookup, access, self/assisted intake, evidence/alternatives, receipt and limits: §§7–9, 13; P01–07, A01–03, C05, S01–03. | AT-01–11, AT-26. |
| FR-14–24 | Permanent/provisional labels, person/family history, representative changes, transfers/splits/merges, corrections, alias continuity and private documents: §§10–11, 19; C02–07, C10–14. | AT-12–17, AT-24, AT-39–40. |
| FR-25–32 | Verification, reasoned decisions, jurisdiction/assignment, status, appeal and grievance: §§10–11, 13; S04–10, C04/C07/C13. | AT-12, AT-25–28. |
| FR-33–40 | Source ownership/freshness, reconciliation, conflict, provenance and restricted facts: §§8–9, 11, 13, 19; C03/C07, S11. | AT-03–04, AT-15–17, AT-38–40. |
| FR-41–55 | Department onboarding, contracts, scoped reuse/disclosure, scheme states/passbook, aggregate reporting and interoperability: §§12–14, 18–19; P08–10/P20, C08–12, D01–05, S12–13. | AT-18–24, AT-29–32, AT-37, AT-40. |
| FR-56–61 | Controlled configuration, roles/reference data, reporting/content and integration operations: §§13–15, 18–19; M01–05, S12–13. | AT-28–32, AT-39. |
| FR-62–74 | Independent non-ration intake, per-person evidence, exceptions, inclusive access/drafts and tracked review: §§8–9, 13; P06, A01–03, C05, S01–06. | AT-04–11, AT-16, AT-26. |
| FR-75–94 | Individual declarations/certificates, list/validity distinctions, restricted access, source correction, referrals and redress: §§9.2/9.5, 11–13, 18–19; C03/C07/C09/C13, S09–11. | AT-08, AT-15–16, AT-19–20, AT-24–25, AT-36. |
| FR-95–106 | PDS/non-PDS branches, secure lookup and recovery, disputes, ownership of corrections and no automatic ID duplication: §§8–11, 13; P05–07, A01–03, C02–07. | AT-03–06, AT-12, AT-14–17, AT-39. |
| FR-107–124 | Scheme catalogue/configuration, subject/income period, dated recommendations, handoff, award/payment/in-kind separation and owner-specific evidence: §§12, 14–15, 19; P08–10, C08–09, M04–05. | AT-18–24, AT-30–31, AT-38, AT-42. |
| FR-125–137 | Task clarity, controlled life-event/source updates, passbook/access history, fees/receipts, misconduct, transparent casework and notices: §§7–13, 15, 19; P03–07/P18, C04–14, S01–13. | AT-01, AT-12–15, AT-23–28, AT-40. |
| FR-138–140 | Approved external subjects, typed ownership/beneficiary roles, de-linking and dated scheme-specific assessed/contributor sets: §§12.6, 14, 19; relevant P09/C09, S05/S11, M04–05. | AT-21–22, AT-39, AT-42. |

### 23.2 Nonfunctional coverage and boundaries

| Companion range | Frontend contribution and related requirements | Evidence responsibility |
|---|---|---|
| NFR-01–07 | Bounded/paginated views, performance/outage behavior and controlled portable hosting: §§18–20; FE-37–39, FE-NFR-03–06/11/14. | System team proves scale, availability, failover and disaster recovery. UI measurements cannot prove statewide capacity. |
| NFR-08–13 | Minimal payloads, scoped access, identity alternatives, safe sessions/audit and legal notices: §§8–9, 13, 18–19; FE-06/11/22/29/38–40. | Security/privacy owners plus cross-account and storage tests; backend owns encryption, authorization and audit integrity. |
| NFR-14–15 | GIGW/accessibility, Gujarati/English and non-destructive names: §§15–16, 20; FE-35, AX-01–14, FE-NFR-01–02/10/17. | Manual/automated accessibility, native-language review and applicable government assurance. |
| NFR-16–19 | Idempotent UI intents, conflict handling, freshness, safe errors/metrics: §§10–12, 17–20; FE-18/19/26/41, FE-NFR-07/11/16. | Frontend/API contract and integrated replay/concurrency tests; backend guarantees durable consistency. |
| NFR-20–23 | Secure build/runtime, versioned contracts, cutover-safe links/sessions and recovery messages: §§14, 18–21; FE-31/37–42, FE-NFR-12/15. | Security and infrastructure owners prove penetration results, migration reconciliation, encrypted backups and restore—not just UI approval. |
| NFR-24–27 | Saved drafts, low-end connectivity, scoped aggregates, human review and privacy-safe telemetry: §§9, 13, 18–21; FE-14/18/30, FE-NFR-04/08/14/16. | End-to-end recovery/usability plus approved incident/retention and independent review procedures. |
| NFR-28–33 | Restricted certificate facts, no sensitive URL/card data, list versions and unknown/mismatch handling: §§9.5, 12–13, 18–19; FE-20/25/29/39–41. | Per-role payload checks and independent mixed-category/list/expiry scenarios. |
| NFR-34–39 | Non-PDS outage behavior, versioned form rules, synthetic fixtures, review/error metrics and aggregate suppression: §§8–9, 13, 18–21; FE-13/41/42, FE-NFR-09/13/16. | Frontend failure tests with backend load and independently reviewed fairness/coverage evidence. |
| NFR-40–47 | Independent scheme contracts, dated assessment/explanations, partial feed and reported outcome boundaries: §§12, 14, 19–21; FE-24–27/31–33, FE-NFR-11/18. | Scheme owners certify rules/subject sets and outcomes; backend owns threshold jobs, throughput, replay and evaluation. |
| NFR-48–54 | Conditional managed offline mode, nonmandatory GPS, enumeration defenses, reconciled counts, effective-dated rules and minimized passbook data: §§8–9, 12–14, 18–20. | Device/security/privacy and source owners; no general-browser offline identity cache. |
| NFR-55–58 | End-to-end route clarity, service queues/times, misconduct escalation and protected status/passbook: §§7–13, 20–21; FE-01–05/19/23/26/28–30. | Journey tests, operations audit, authorization and real pilot measurements. |
| NFR-59–63 | Late/corrected life events, propagation, fees, delayed/reversed benefits, human contest and no unapproved AI dependency: §§10–13, 18–21; FE-18–27/30/41. | Source-replay, historical decision, fee reconciliation and independent review; frontend must show actual outcomes. |
| NFR-64–65 | Typed external subject/link history and reproducible dated subfamilies/contributors: §§12.6, 14, 19, 21. | Owner-approved connector and historical assessment conformance; AT-21–22/39/42. |

Frontend-specific coverage: FE-01–10 define public access/shell/content; FE-11–23 define access, intake and identity lifecycle; FE-24–27 define scheme/benefit journeys; FE-28–33 define assisted, staff and department work; FE-34–36 define content/localization/components; FE-37–42 define hosting, privacy, concurrency and integration adapters. FE-NFR-01–18 and AX-01–14 add measurable quality checks. Requirements cannot be marked delivered solely because a matching heading or screen exists.

## 24. Source register, retained evidence and access notes

### 24.1 Method and interpretation

Research was checked on **20 September 2026** using official public pages, official PDFs, browser inspection and selected computed styles. Live visual comparisons were desktop captures; they are **not** a mobile, accessibility or security audit of the comparator services. Web-reader content established text where a direct browser was blocked; it did not establish rendered layout. No firewall/CAPTCHA or certificate warning was bypassed and no authenticated application was submitted.

Visual evidence is retained under [docs/frontend-research](docs/frontend-research/README.md). PDF illustrations were rendered from their source documents; live screenshots can contain broken third-party media, banners or initial overlays. An asset's presence in this evidence folder is **not** a license or approval to place it on the new production website. Source facts support the observations; all new layouts, routes, token roles, controls, performance budgets and operating proposals remain explicitly proposed.

### 24.2 Gujarat sources

| Ref | Official source and evidence scope |
|---|---|
| [G01] | Ahmedabad district homepage; live text, screenshot and selected computed styles. Ownership, utilities, navigation, services and footer comparator. |
| [G02] | Gujarat Social Justice and Empowerment homepage, English; official text inspected. Direct browser firewall challenge limits visual conclusions. |
| [G03] | Gujarat Informatics Limited: Digital Gujarat description; official text supports service/channel context, not a signed SSO or API agreement. |
| [G04] | Gujarat DST: Projects and Initiatives; official descriptions of Digital Gujarat, assisted services and Seva Setu. |
| [G05] | Gujarat DST: Accessibility Features; text inspected, including some legacy browser-specific instructions that were not copied as current requirements. |
| [G06] | Mari Yojana homepage; official searchable catalogue text. Direct browser blocked during this research. |
| [G07] | Mari Yojana official 27-page scheme-portal manual; text and selected rendered screenshots inspected. Original screenshot capture/publication date not established. |
| [G08] | Chief Minister Office, Gujarat, English homepage; current official text, including office-bearer identification. Local browser styling was incomplete. |
| [G09] | Gujarat Women and Child Development homepage; official scheme listings, content and help references. |
| [G10] | e-Samaj Kalyan portal; attempted browser access reached firewall challenge. Destination corroborated by SJE scheme material; no private workflow inspected. |
| [G11] | iKhedut portal; attempted browser access reached firewall challenge. Official government directory corroborates destination. |
| [G12] | Gujarat Food, Civil Supplies and Consumer Affairs; access blocked/unavailable in this review. Do not treat older statistics as newly verified frontend content. |
| [G13] | Integrated Government Online Directory, Gujarat organisations/portals; corroborates government destinations including welfare/agriculture services. |
| [G14] | Directorate of Social Defense: Sant Surdas Yojana, English; scheme context and stated channels read. Future published rates/thresholds still require owner currency checks. |
| [G15] | Gujarat state portal; attempted access failed/certificate-name mismatch. No layout or current-content claim relies on it. |
| [G16] | WCD: Mukhyamantri Matrushakti Yojana; dated 6 February 2023 scheme content read. Current footer is not proof of a revised scheme rulebook. |
| [G17] | WCD: Ganga Swarupa Pension Scheme; dated 31 January 2023 content read. No old amount is adopted as an approved current benefit. |
| [G18] | Digital Gujarat public `www` destination; direct browser firewall challenge. G03/G04 provide readable official explanatory evidence. |

### 24.3 Family-ID and discovery sources

| Ref | Source and evidence scope |
|---|---|
| [F01] | UP Family ID live English homepage at the working `.aspx` route; browser text/styles/screenshot inspected. The supplied older `.html` route was not usable through the web reader. |
| [F02] | UP Family ID English FAQ PDF, five pages; downloaded/read. Older instructions are not assumed to override newer live service actions or apply to Gujarat. |
| [F02a] | UP public registration entry; inspected without entering resident data or sending an OTP. |
| [F02b] | UP public tracking entry; inspected without querying a real application. |
| [F03] | Ghaziabad district Family ID notice, reconstructed Hindi URL; official public text read. |
| [F04] | NeGD/India Stack Local UP Family ID case study; official text and linked architecture/process diagram inspected. |
| [F04a] | Direct official-CDN diagram linked by F04; recovered visual evidence for the process flow described in the user's missing Excalidraw. |
| [F05] | SATHEE IIT Kanpur article supplied in the research; returned 403. No unseen article claim is used as evidence. |
| [F06] | Haryana PPP/beneficiary portal; live public options, presentation and help content inspected. No authenticated family contents inspected. |
| [F07] | Gurugram district PPP page; official self-update/form/assistance references. |
| [F08] | Rajasthan Jan Aadhaar homepage; live text/styles/screenshot. The retained image includes an initial promotional modal; it is not an unobstructed whole-page layout audit. |
| [F09] | Rajasthan Jan Aadhaar FAQ endpoint; supplementary official reference. No complete current field list or Gujarat intake mandate is inferred from it. |
| [F10] | Madhya Pradesh Samagra homepage; live public service directory and screenshot. Authenticated corrections/e-KYC were not executed. |
| [F11] | Karnataka Kutumba services page; live procedure/checklist/application navigation and screenshot. Page displayed update date 28 August 2024. |
| [F12] | Telangana government release, September 2024, “One State–One Digital Card”; historical proposed/pilot scope, not proof of current production coverage. |
| [N01] | myScheme; official public discovery/detail/application guidance comparator, not an authority to grant any individual benefit. |

### 24.4 Standards, technical and naming references

| Ref | Source and use |
|---|---|
| [N02] | GIGW 3.0 guidelines; identity, public content, ownership, accessibility, security and governance baseline. Apply the relevant full checklist, not just selected UI checks here. |
| [N03] | W3C WCAG 2.2 Recommendation; proposed full AA product target. |
| [N04] | STQC website quality certification; certification is a separate assurance process, not a status this project currently holds. |
| [N05] | Official DBIM guidelines PDF, 177 pages; selected scope, colour and typography material inspected. Figure 1 on PDF page 26/printed page 6 supplies the proposed blue palette. Government of India scope does not automatically settle Gujarat applicability. |
| [N06] [N06a] | Official UX4G component and developer guidance; candidate design-system reuse/self-hosting reference, not an imposed framework/version. |
| [A01] | W3C Understanding Accessible Authentication (Minimum); authentication assistance and alternatives. |
| [A02] | W3C Understanding Contrast (Minimum); text contrast. |
| [A03] | W3C Understanding Reflow; narrow-width/zoom behavior. |
| [A04] | W3C Understanding Error Identification; textual identification of input errors. |
| [A05] | W3C Understanding Status Messages; programmatic announcement without unnecessary focus movement. |
| [A06] | W3C Understanding Focus Not Obscured (Minimum); focused target visibility. |
| [A07] | W3C Understanding Target Size (Minimum); 24px floor/exception rules distinguished from proposed 44px targets. |
| [A08] | WAI-ARIA Authoring Practices: Modal Dialog Pattern; dialog keyboard/focus design. |
| [T01] | MDN HTTP caching guidance; explicitly protect personalized responses and distinguish public/private caches. |
| [T02] | OWASP HTML5 Security Cheat Sheet; browser storage and client-side exposure considerations. |
| [T03] | MDN Content Security Policy guidance; defense-in-depth policy design. |
| [T04] | web.dev Web Vitals; field thresholds/percentile for LCP, INP and CLS. Local lab/bundle budgets remain project proposals. |
| [B01] | Publisher's “Parivar Setu” app listing on Google Play; narrow evidence of an existing private name, not a government endorsement or legal name-clearance search. |

### 24.5 Retained visual evidence

| Artifact | What it supports; limitation |
|---|---|
| [Ahmedabad screenshot](docs/frontend-research/gujarat-ahmedabad.png) | Gujarat district shell, identity, navigation/footer; live desktop only. G01. |
| [UP screenshot](docs/frontend-research/up-family.png) | Prominent citizen-task structure and colours; some embedded media/widget rendering may be incomplete. F01. |
| [Haryana screenshot](docs/frontend-research/haryana-ppp.png) | Known/forgotten/new-ID and phone recovery, scheme/help layout; public homepage only. F06. |
| [Samagra screenshot](docs/frontend-research/mp-samagra.png) | Grouped family/person/lifecycle actions; no private flow verification. F10. |
| [Kutumba screenshot](docs/frontend-research/karnataka-kutumba.png) | Procedure/checklist/application separation and ownership; dated public content. F11. |
| [Jan Aadhaar screenshot](docs/frontend-research/rajasthan-jan.png) | Initial homepage presentation/modal; underlying full layout partly obstructed. F08. |
| [UP process-flow image](docs/frontend-research/up-flow.jpeg) | Official recovered PDS/provisional/verification/approval flow; not a direct image extraction from the missing Excalidraw. F04/F04a. |
| [DBIM palette page](docs/frontend-research/dbim-palette.png) | Selected official palette; role assignments in §6 are this project's proposals. N05. |
| [Mari Yojana manual page 2](docs/frontend-research/mari-manual-page-2.png) | Manual homepage/search screenshot; unknown original capture date. G07. |
| [Mari Yojana manual page 7](docs/frontend-research/mari-manual-page-7.png) | Scheme directory/detail navigation and dark-blue content bars. G07. |
| [Mari Yojana manual page 8](docs/frontend-research/mari-manual-page-8.png) | Scheme criteria, application guidance and form/document structure in the manual. G07. |

Source URLs are research provenance, not a promise that every endpoint will remain reachable. Production content/link owners must recheck canonical destinations, rule currency, terms of asset use and integration authority before release. The companion requirements file is preserved; this document adds a frontend-specific layer rather than silently revising the baseline.

[G01]: https://ahmedabad.nic.in/ "Ahmedabad district, Government of Gujarat"
[G02]: https://sje.gujarat.gov.in/Home?lang=english "Gujarat Social Justice and Empowerment"
[G03]: https://gil.gujarat.gov.in/digital_gujarat "GIL: Digital Gujarat"
[G04]: https://dst.gujarat.gov.in/Home/ProjectsandInitiatives "Gujarat DST: Projects and Initiatives"
[G05]: https://dst.gujarat.gov.in/Home/AccessibilityFeatures "Gujarat DST: Accessibility Features"
[G06]: https://mariyojana.gujarat.gov.in/Default.aspx "Mari Yojana"
[G07]: https://mariyojana.gujarat.gov.in/Images/img/Mari%20Yojana%20schemes.pdf "Mari Yojana scheme-portal manual"
[G08]: https://cmogujarat.gov.in/en "Chief Minister Office, Gujarat"
[G09]: https://wcd.gujarat.gov.in/ "Gujarat Women and Child Development"
[G10]: https://esamajkalyan.gujarat.gov.in/ "e-Samaj Kalyan"
[G11]: https://ikhedut.gujarat.gov.in/ "iKhedut"
[G12]: https://fcsca.gujarat.gov.in/gu/home "Gujarat Food, Civil Supplies and Consumer Affairs"
[G13]: https://igod.gov.in/index.php/sg/GJ/SPMA/organizations "Government directory: Gujarat organisations and portals"
[G14]: https://sje.gujarat.gov.in/dsd/scheme/sant-surdash-yojana?lang=english "Gujarat Social Defense: Sant Surdas Yojana"
[G15]: https://gujaratindia.gov.in/ "Gujarat state portal: attempted research destination"
[G16]: https://wcd.gujarat.gov.in/initiativedetails?id=292 "Gujarat WCD: Mukhyamantri Matrushakti Yojana"
[G17]: https://wcd.gujarat.gov.in/initiativedetails?id=231 "Gujarat WCD: Ganga Swarupa Pension Scheme"
[G18]: https://www.digitalgujarat.gov.in/ "Digital Gujarat"
[F01]: https://familyid.up.gov.in/portal/Home_en.aspx "Uttar Pradesh Family ID"
[F02]: https://familyid.up.gov.in/portal/assets/docs/faqe.pdf "UP Family ID English FAQ"
[F02a]: https://familyid.up.gov.in/portal/registration.aspx "UP Family ID public registration entry"
[F02b]: https://familyid.up.gov.in/portal/track.aspx "UP Family ID public application tracking entry"
[F03]: https://ghaziabad.nic.in/%E0%A4%AB%E0%A5%88%E0%A4%AE%E0%A4%BF%E0%A4%B2%E0%A5%80-%E0%A4%86%E0%A4%880%E0%A4%A1%E0%A5%800-%E0%A4%8F%E0%A4%95-%E0%A4%AA%E0%A4%B0%E0%A4%BF%E0%A4%B5%E0%A4%BE%E0%A4%B0-%E0%A4%8F%E0%A4%95-%E0%A4%AA/ "Ghaziabad district: Family ID — One Family, One Identity"
[F04]: https://negd.gov.in/isl/Directory/statedata/95 "NeGD India Stack Local: UP Family ID"
[F04a]: https://cdn.indiastacklocal.in/assets/uploads/66f7c0c4f2e0farchitecture.jpeg "NeGD-linked UP process-flow diagram"
[F05]: https://sathee.iitk.ac.in/exam-hub/year-wise-announcement/2023/up-family-id/ "SATHEE IITK UP Family ID article: access denied during review"
[F06]: https://meraparivar.haryana.gov.in/ "Haryana Parivar Pehchan Patra / beneficiary portal"
[F07]: https://gurugram.gov.in/ppp/ "Gurugram district: Parivar Pehchan Patra"
[F08]: https://janaadhaar.rajasthan.gov.in/content/raj/janaadhaar/en/home.html "Rajasthan Jan Aadhaar"
[F09]: https://janaadhaar.rajasthan.gov.in/content/raj/janaadhaar/en/faqs1.html "Rajasthan Jan Aadhaar FAQs"
[F10]: https://samagra.gov.in/ "Madhya Pradesh Samagra"
[F11]: https://kutumba.karnataka.gov.in/en/Index/Services "Karnataka Kutumba: Services"
[F12]: https://www.telangana.gov.in/news/press-releases/2024/09/one-state-one-digital-card/ "Telangana: One State–One Digital Card, September 2024"
[N01]: https://www.myscheme.gov.in/ "myScheme"
[N02]: https://guidelines.india.gov.in/guidelines/ "Guidelines for Indian Government Websites 3.0"
[N03]: https://www.w3.org/TR/WCAG22/ "W3C Web Content Accessibility Guidelines 2.2"
[N04]: https://www.stqc.gov.in/website-quality-certification-0 "STQC Website Quality Certification"
[N05]: https://dbimtoolkit.digifootprint.gov.in/static/uploads/2025/11/03a34d4eb92afc50f48800511d22c297.pdf "DBIM Guidelines: official identity toolkit PDF"
[N06]: https://www.ux4g.gov.in/components "UX4G Components"
[N06a]: https://www.ux4g.gov.in/get-started/for-developers "UX4G guidance for developers"
[A01]: https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html "Understanding Accessible Authentication (Minimum)"
[A02]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html "Understanding Contrast (Minimum)"
[A03]: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html "Understanding Reflow"
[A04]: https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html "Understanding Error Identification"
[A05]: https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html "Understanding Status Messages"
[A06]: https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html "Understanding Focus Not Obscured (Minimum)"
[A07]: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html "Understanding Target Size (Minimum)"
[A08]: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ "WAI-ARIA Modal Dialog Pattern"
[T01]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching "MDN: HTTP caching"
[T02]: https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html "OWASP: HTML5 Security Cheat Sheet"
[T03]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP "MDN: Content Security Policy"
[T04]: https://web.dev/articles/vitals "web.dev: Web Vitals"
[B01]: https://play.google.com/store/apps/details?hl=en_IN&id=com.parivarsetu "Parivar Setu: publisher app listing"
