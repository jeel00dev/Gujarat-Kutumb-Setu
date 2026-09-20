# Gujarat Kutumb Setu: government visual redesign specification

**Status:** implementation direction  
**Research/audit date:** 20 September 2026 (Asia/Kolkata)  
**Applies to:** public portal, citizen account, assisted-service screens, staff workspaces, department console, receipts and every diagram in `docs/graphs/`

## 1. Decision

The portal must look and behave like a Gujarat government transaction service, not like a marketing landing page. Use the approved product name as a bilingual lock-up:

> **ગુજરાત કુટુંબ સેતુ**  
> Gujarat Kutumb Setu  
> Family identity and connected government services

The stable visual foundation is a deep-blue Gujarat government shell, Gujarati-first content, a restrained orange accent, strong ownership cues, direct service actions, public notices/documents, and visible assisted-service routes. The application must not copy an old government website pixel-for-pixel. Existing official portals are evidence for government identity and information architecture; the implementation must retain modern accessibility, responsive behaviour, security and performance.

This is the required direction for the current redesign. It defines a **structural conformance target**, not a claim of GIGW/STQC certification or permission to use a protected emblem. Certification and a government-supplied, approved emblem/logo asset remain launch gates.

## 2. Evidence and what it means for this product

Only official primary sources were used for the decisions below.

| Official evidence | Observation | Design consequence |
|---|---|---|
| [Mari Yojana, Government of Gujarat](https://mariyojana.gujarat.gov.in/Default.aspx), inspected 20 Sep 2026; page reports last update 9 Jan 2025 | Gujarati-first service discovery; government emblem/product mark; persistent search; accessibility/language controls; scheme taxonomies; a short “how it works”; policy/owner footer. | Make Gujarati the default, put a service/family search in the upper page, group services by citizen task, explain the process, and provide policy/ownership information. Do not reproduce its hero artwork, floating accessibility widget or large repeated tile field. |
| [Digital Gujarat project description, Gujarat Informatics Limited](https://gil.gujarat.gov.in/digital_gujarat), inspected 20 Sep 2026 | Officially describes a single-window portal covering 100+ web services; one-time registration/authentication; e-Gram, ATVT, web and mobile channels; simplified forms, online payment and application tracking. | Kutumb Setu is a service platform, not a brochure. “Apply”, “Find/verify”, “Update”, “Track” and “Get assistance” are primary navigation. Authentication, tracking and payment/status screens use one consistent shell. |
| [DST Gujarat projects and initiatives](https://dst.gujarat.gov.in/Home/ProjectsandInitiatives), inspected 20 Sep 2026; page reports last update 11 Sep 2026 | Describes more than 110 Digital Gujarat services and two delivery modes: online and physical assisted counters at district, taluka, Jan Seva Kendra and e-Gram levels. | Every major citizen journey must expose both self-service and assisted-service guidance. Never treat desktop web as the only channel. Show operator context clearly on assisted transactions. |
| [Ahmedabad District, Government of Gujarat](https://ahmedabad.nic.in/), inspected 20 Sep 2026 | Bilingual government utility strip; emblem and district owner lock-up; deep-navy primary navigation with an orange current item; notices, public utilities, find-services, helplines, policies and NIC ownership. | Use an authoritative three-level header and a content-rich government footer. Include notices/help/documents without turning the home page into a promotional hero. Do not copy its carousel, dense partner-logo strip or obsolete content patterns. |
| [Gujarat district portal, NIC/S3WaaS](https://gujarat.s3waas.gov.in/), inspected 20 Sep 2026 | Government of Gujarat district sites are explicitly powered through the NIC S3WaaS framework. | The recognisable government shell—ownership, bilingual access, global navigation, search, notices and footer provenance—is a stronger reference than a commercial SaaS layout. |
| [UP Family ID](https://familyid.up.gov.in/portal/Home_en.aspx), inspected via public shell captured 20 Sep 2026 | Presents four immediate actions—start, track, update and passbook—followed by how-to, FAQs and an explanation of what the ID does. | Surface task actions before narrative copy. Explain scope and exclusions close to the actions. Do not adopt its political portraits, olive/orange colour scheme or inaccessible widget behaviour. |
| [Haryana Mera Parivar](https://meraparivar.haryana.gov.in/), public shell captured 20 Sep 2026 | Gives existing-ID, forgotten-ID, create-ID and mobile-update choices together, plus scheme/service discovery. | Sign-in must not be the only mental model. Offer explicit routes for finding an ID, applying, recovering access and correcting data. |
| [Rajasthan Jan Aadhaar](https://janaadhaar.rajasthan.gov.in/), inspected 20 Sep 2026; page reported a 2026 update | Prioritises enrolment, verification, e-card/e-KYC, updates, recent circulars and helpdesk information. | Use operational verbs and make official updates/circulars findable. Do not reproduce the splash modal or an icon-heavy portal grid. |
| [GIGW 3.0 official guidelines](https://guidelines.india.gov.in/guidelines/), inspected 20 Sep 2026 | Requires prominent authorised visual identity, ownership on entry pages, meaningful headings/labels, more than one way to locate content, colour-independent cues, correct focus order and sufficient contrast. Its minimum homepage content includes organisation/project identity and logo as applicable, About/functions, major modules and citizen services, Contact, Feedback, National Portal, Search/Sitemap and Terms; subsequent screens need a self-explanatory title, home/parent links, ownership and Contact. | Ownership, service structure, search, sitemap, document metadata, keyboard flow, semantic headings, visible focus and text status labels are release requirements rather than decoration. Each deep-linked transaction page must still establish context and owner. |
| [DBIM official manual](https://dbimtoolkit.digifootprint.gov.in/static/uploads/2025/01/b70a5719408bd6d60040eda3ac042053.pdf), inspected 20 Sep 2026 | Specifies one primary colour group, functional colours, one consistent icon style, Noto Sans for multilingual government interfaces, standard header controls and a darkest-key-colour footer. | Use the DBIM blue group and Noto Sans/Noto Sans Gujarati. Keep iconography, component states and footer consistent. DBIM is a strong harmonisation reference; final applicability to this Gujarat state product must be confirmed by the government owner. |
| [UX4G Design System 3.0 patterns](https://www.ux4g.gov.in/patterns), inspected 20 Sep 2026 | Organises reusable service patterns into identity/access, consent/declaration, application/submission, status/tracking, payment, search, dashboards, notifications and feedback/assisted service; stresses progressive disclosure, clear feedback and consistent mobile-first navigation. | Treat the site as one coherent government transaction service: OTP, consent, draft/resume, receipt, tracking, payment recovery and grievance states must share components and language rather than being independently styled pages. |
| [Directorate of ICT & e-Governance accessibility page](https://directorit.gujarat.gov.in/help), inspected 20 Sep 2026 | States GIGW 3.0/WCAG 2.1 intent and calls out skip links, descriptive links, document type/size, table headers, structured headings and page titles. | These patterns must be implemented directly in the product and verified, not delegated to an accessibility overlay. |

The reference “One Family – One ID” process image supplied by the project owner is the mandatory grammar for diagrams: white canvas, navy/medium-blue nodes and connectors, reserved orange action/outcome blocks, conventional flowchart shapes and a dashed verification boundary. Section 12 specifies its use.

## 3. Audit of the current frontend

### Keep

- Self-hosted Noto Sans and Noto Sans Gujarati.
- Gujarati/English switching, skip link, semantic landmarks and visible focus intent.
- A restrained blue base, clear forms and privacy-aware test-environment disclosure.
- Direct routes for family services, schemes, help and authenticated workspaces.

### Replace

- The generic people-outline product icon is not an official identity. Replace it with an approved emblem/product lock-up; until approval, use a text lock-up and an explicit asset placeholder in non-production builds only.
- “Your family. A simpler way forward.” and “A stronger connection. Services within reach.” read as advertising. Replace them with task and eligibility language.
- The orbiting-icons hero illustration, pale oversized hero field and tiny all-caps eyebrow labels look like a startup template. Remove them.
- Six nearly identical cards followed by more cards create an undifferentiated “AI-generated dashboard” rhythm. Use a short task panel, structured service lists, a status/search panel and editorial notice/document sections.
- The page is too sparse where government trust information should be dense: owner department, service scope, assisted channels, latest notices, document metadata, grievance route, policies and update date.
- The mobile page is a long procession of boxed tiles. Put the four essential tasks first, use compact list rows thereafter, and reveal secondary information progressively.
- Large blocks of pale blue, broad white gaps, excessive rounded boxes and decorative shadows must not carry the visual identity.
- Do not expose test fixtures as prominent public-site content. A test/UAT environment gets one narrow, persistent and non-dismissible banner; the rest of the frontend stays identical to live.

## 4. Visual identity and tokens

### 4.1 Colour system

Use the **DBIM blue group as the single primary group**. The values also fit the supplied process-flow reference and the established deep-blue Gujarat portal pattern.

| Token | Value | Use |
|---|---:|---|
| `--gov-blue-900` | `#162F6A` | masthead text, primary navigation, footer, diagram title nodes |
| `--gov-blue-700` | `#214AAB` | primary controls, links, selected tabs, focus ring |
| `--gov-blue-500` | `#5279D7` | diagram connectors, secondary graphic detail only |
| `--gov-blue-200` | `#A3BBF3` | selected-row or information emphasis with dark text |
| `--gov-blue-100` | `#D2DFFF` | very light information background |
| `--ink-900` | `#233047` | normal text and table content |
| `--surface` | `#FFFFFF` | page and form surface |
| `--surface-muted` | `#F4F6F9` | utility strip, table alternate row, grouped section |
| `--border` | `#C6CCD6` | inputs, tables, cards and dividers |
| `--gov-orange-700` | `#C1530B` | **limited** Gujarat/reference accent: active nav rule and diagram action nodes |
| `--gov-orange-900` | `#9C3B00` | accent text where orange is used on white |
| `--success` | `#198754` | approved/complete status, always with text/icon |
| `--warning-text` | `#946200` | pending/attention text on a pale warning surface |
| `--error` | `#DC3545` | error/rejected status, always with text/icon |
| `--info` | `#0D6EFD` | information status only |

Verified contrast examples: blue-900/white `12.74:1`, blue-700/white `7.98:1`, orange-700/white `4.66:1`, ink/white `13.25:1`, success/white `4.53:1`, error/white `4.53:1`. Still test every actual foreground/background pair, including disabled and hover states.

Rules:

- Deep blue must visibly own the product. Orange occupies no more than roughly 10% of a normal page and never becomes a second full-page theme.
- Use no multi-hue gradients. A same-blue tonal gradient is permissible only for a small official banner and is not needed for transaction screens.
- Status is never conveyed by colour alone; pair colour with a label and, when helpful, a consistent icon.
- Never use pale grey text below `4.5:1` contrast to create a “premium” look.

### 4.2 Typography

- Font family: self-hosted `Noto Sans Gujarati`, `Noto Sans`, system sans-serif fallback. No display serif, geometric startup font or remote font request.
- Gujarati page content receives `lang="gu"`; English content receives `lang="en"`, including isolated bilingual names.
- Desktop scale: H1 36/44, H2 24/32, H3 20/28, body 16/24, supporting text 14/21, metadata 12/18.
- Mobile scale: H1 24/32, H2 20/28, H3 16/24, body 14/21. Form inputs remain at least 16px to avoid browser zoom.
- Weight: 700 headings, 600 labels/actions, 400 body. Reserve 800 only for a small numeric datum.
- Sentence case. Do not use spaced all-caps eyebrow text. Gujarati strings must not receive artificial letter spacing.
- Body copy is left-aligned. In data tables, labels/text are left-aligned, numbers right-aligned and column headings consistently aligned.

### 4.3 Shape, spacing and iconography

- Base spacing unit 4px; normal sequence 8, 12, 16, 24, 32, 48.
- Content maximum width 1200px; readable prose 760px; form content 840px.
- Radius 4px for controls and 6px for bounded sections. Pills are for short statuses only.
- Borders are 1px and visible. Avoid shadows on normal cards; one subtle shadow is allowed for an open dialog/menu.
- Use one line-icon family throughout, with a 2px-equivalent stroke. Standard sizes are 20/24px in controls and 32/48px only for service-category anchors.
- Every icon accompanying an action has text. Icon-only controls require an unambiguous accessible name and are limited to conventional actions such as close/search.

## 5. Government page shell

### 5.1 Desktop header

Use four stable layers, in this order:

1. **Environment strip, test/UAT only — 28–32px.** Amber-tinted surface, shield/test icon, text “Test environment · synthetic records · no live government transactions.” It must not alter navigation or expose fixture credentials.
2. **Government utility strip — 34–38px.** Left: “ગુજરાત સરકાર | Government of Gujarat”. Right: “Skip to main content”, Gujarati/English control, accessibility, help/contact. Use real text, not a row of unexplained icons.
3. **Identity masthead — 76–92px.** Left: authorised emblem or approved product logo at its required ratio; bilingual product name; owning department/office supplied by the government owner. Right: persistent site search and “Sign in / My account”. Remove slogans.
4. **Primary navigation — 48–52px.** `#162F6A` background, white text, orange 4px active rule. Recommended labels: Home; Family ID services; Track application; Schemes; Help & centres; About. Staff links do not appear in citizen primary navigation.

The header must remain recognisably the same on public, citizen and staff pages. An authenticated context bar may show the signed-in person, role and sign-out action below navigation; it must not replace government ownership.

### 5.2 Logo/emblem rules

- Do not generate, trace or redraw a government emblem with AI.
- Obtain the authorised vector/raster asset and written usage decision from the government owner. Preserve ratio and colour and provide useful alternative text.
- If the organisation is not authorised to use the State Emblem, use the approved organisation/product logo lock-up instead.
- Do not add Prime Minister, Chief Minister, Digital India, MyGov, G20 or partner logos unless the owner supplies the approved asset and requires its placement. Maximum co-branding logos in the masthead: two.

### 5.3 Footer

Footer background is `#162F6A`; text/links are white or blue-100. It contains:

- exact website ownership/maintenance lineage;
- Family ID services, information/support and related official links;
- accessibility statement, screen-reader access, privacy, terms, copyright, hyperlink policy, grievance/feedback and a two-level sitemap;
- page/content last-updated date, not a misleading build date;
- official contact and assisted-service route only after data owner approval;
- external-link indicators and link purpose in text.

Avoid visitor counters, logo walls and social-media icons unless they serve a current, approved requirement.

## 6. Home-page structure

The first viewport must answer “Where am I, what can I do, and can I get help?”

1. **Official notice line.** One compact, dated alert area for outage, deadline or service announcement; no marquee.
2. **Task-first service panel.** Heading: “કુટુંબ આઈડી સેવાઓ / Family ID services”. Four strong actions: Find my Family ID; Apply for a Family ID; Update family details; Track an application. Add a separate secondary route for recovery and an assisted-service link. Each action has one sentence of eligibility/context.
3. **Existing ration-card choice.** A plain two-route information block: “I have a ration card” / “I do not have or cannot find one”, with accurate outcomes and no promise of automatic approval.
4. **How the service works.** Four numbered steps: check existing record; provide family details; verification; receive/update the Family ID. Use a compact step line, not a decorative orbit.
5. **Schemes and connected services.** Search plus citizen-oriented filters/categories. Make clear that a Family ID can support matching but does not guarantee a benefit.
6. **Latest notices and documents.** Table/list with title, issuing office, publication date, language, type and size. Examples: circulars, forms, service updates and privacy notices. Never publish invented notices.
7. **Assisted service and help.** Explain online and counter routes; link to a verified centre finder or owner-approved list. Show verified helplines only.
8. **Frequently asked questions.** Five to eight real questions, collapsed by default, followed by the full help centre.

Use an editorial grid with rules/dividers and clear section headings. Restrict bordered service tiles to the first task panel and scheme categories; everything must not be a card.

## 7. Public information and service pages

- Start with breadcrumbs, H1, one-sentence purpose and “Last updated”.
- Provide an in-page contents list for long guidance.
- For every service, show: who can use it, prerequisites, required documents, fee (`No fee` when applicable), expected processing stage—not an invented duration—how to apply, assisted route, tracking route, grievance/escalation and privacy use.
- Document links state title, issuing authority, language, file type and size. External links state that they open another official service.
- Search/list pages use filters above results, an explicit result count, sort label, empty state and pagination. Do not infinite-scroll government records.
- “Read more”, “Click here” and icon-only arrows are not valid standalone link labels.

## 8. Registration and form design

### 8.1 Page pattern

- Breadcrumbs → H1/service summary → stepper → validation/error summary → form → actions.
- Desktop uses a 240px step/summary rail only when it improves a long journey; otherwise use a horizontal stepper. Mobile uses a compact vertical/current-step treatment.
- Group related fields with `fieldset` and `legend`: applicant, address, members, evidence, declarations. Do not put every input in its own card.
- Show `Save draft` as secondary and `Save and continue`/`Submit application` as primary. Destructive actions are visually separated and require confirmation.
- Preserve the same frontend and copy between test and live; provider adapters and the narrow environment strip are what change.

### 8.2 Controls

- Labels are above fields and always visible. Placeholder text is an example, never the label.
- Minimum control height 48px; minimum target 44×44px; 12–16px internal horizontal padding.
- Explain required and optional fields in text. Use `*` only with a legend such as “* Required”.
- Hints precede validation. Errors appear beside the field and in a focus-managed summary linking back to invalid fields.
- Use appropriate `autocomplete`, input modes and date handling. Do not use free text where an approved district/taluka relationship exists.
- Mask sensitive identifiers by default. State why a datum is requested and who can see it.
- File upload shows accepted types, maximum size, virus/quarantine state, uploaded name and remove/replace action. Do not use a decorative drag-and-drop area as the only mechanism.
- Before submission, show a plain review summary by section with `Change` links. The declaration is specific, not a single blanket checkbox.
- After submission, show a printable official receipt: service name, applicant, reference, submitted date/time, current state, next action, tracking URL/QR only if approved, and owner/contact.

## 9. Citizen, staff and department workspaces

### Citizen workspace

- H1 plus the Family ID or clear “No Family ID issued” state; never fabricate a card number.
- A prominent pending-action panel precedes statistics.
- Use a compact application list with reference, service, submitted/updated date, status and next action.
- Separate family members, requests/changes, benefits/payment history, documents, notices and grievances with tabs or a left navigation—not a mosaic of dashboard metrics.
- Family members are a semantic table on desktop and a structured disclosure list on narrow screens. Sensitive fields stay masked.

### Staff workspace

- Government shell remains; a clear role/jurisdiction band identifies operator, verifier, approver, administrator or department user.
- Left navigation may be used for queues, search, decisions, reports and audit history. Do not mix citizen and staff actions.
- Queue table columns: reference, service/type, district, received age/date, current stage, assignment and action. Filters are above the table and persisted only when safe.
- A case page uses a two-column desktop layout: case evidence/timeline left; permitted action panel right. The action panel is sticky only if it never hides content.
- Verify, approve, reject, request information, implement, pay/retry/reverse and escalate must be role- and state-specific. Never display a forbidden control “for convenience”.
- Decisions require a reason where the business rule calls for it, show the exact transition, and create a visible audit event.

### Tables and statuses

- Header surface `#F4F6F9`, visible cell dividers, optional very subtle zebra rows, 48px minimum row height.
- Text columns left, numeric amounts right, dates consistently formatted. Use `<th scope>` relationships.
- At narrow widths, keep the table in a labelled horizontal region or render an equivalent semantic disclosure list; do not silently drop columns.
- Status labels use sentence case and a text/icon cue: Draft (neutral), Submitted (blue), Under verification (blue), Needs information (amber), Verified (blue/green), Approved (green), Implemented/Issued (green), Rejected/Failed/Reversed (red), Resolved (green). “Approved” and “Implemented/Issued” remain distinct.

## 10. Accessibility and responsive requirements

Target GIGW 3.0 plus WCAG 2.2 AA; do not claim conformance until manual and automated review is complete.

- Skip to main content and skip to navigation links; correct landmarks, unique page titles and one H1.
- Complete keyboard operation with logical focus order, no traps and a 3px high-contrast focus indicator.
- Text contrast at least 4.5:1; large text and non-text UI components at least 3:1. Colour is never the only cue.
- Reflow at 320 CSS px and 400% zoom without two-dimensional page scrolling except genuine data tables/diagrams.
- User-preferred portrait and landscape orientation; reduced-motion support; no auto-rotating carousel, autoplay media or flashing content.
- Screen-reader announcements for OTP state, validation, saving, submission and status changes. Timeouts provide advance warning and extension where security policy permits.
- Gujarati and English versions have content parity, not merely translated navigation. Language changes preserve the route and entered safe draft data.
- Accessibility controls may expose practical help/high contrast, but no overlay can substitute for semantic HTML and testing.
- Documents need accessible source files. Where a legacy PDF is not accessible, state that and provide an accessible HTML summary or alternative.

### Mobile shell and journeys

- Keep Government of Gujarat identity, language and help visible. Collapse secondary utility items, not ownership.
- Masthead uses the approved mark plus short bilingual name. The menu trigger contains the word “Menu”/“મેનુ” as well as an icon.
- Navigation opens as an in-flow panel or proper dialog, closes with Escape/back and restores focus.
- Essential service actions appear as four compact list rows in the first viewport; never as a giant hero.
- One-column forms, full-width primary action, no horizontal stepper overflow and no fixed element obscuring errors/actions.
- Long tables use an explicitly labelled scroll container or disclosure-list alternative.
- Test at 320, 360, 390 and 768 CSS px, with Gujarati text expansion, 200% text size and both orientations.

## 11. Content voice

- Official, concrete and respectful. Prefer “Apply for a Family ID” over “Begin your journey”.
- Lead with action, eligibility or state. Avoid slogans, metaphors and institutional self-congratulation.
- Never say that Family ID guarantees eligibility, payment or scheme approval.
- Do not call a record “verified”, “approved”, “permanent” or “live” unless the backend state supports that exact claim.
- Distinguish demo/test providers from government records only through the environment disclosure and relevant transaction result; do not turn the interface into a demo persona picker.
- Dates use an unambiguous format such as `20 Sep 2026`; reference numbers preserve Latin characters/digits. Currency uses `₹` and Indian grouping.
- Every empty/error state says what happened, what remains safe, and the next action. Never blame the citizen.

## 12. Mandatory diagram system

All six existing graph families and future ERD/architecture/process diagrams must be redrawn in the supplied process-flow language. The goal is a consistent government presentation system, not a trace of the supplied diagram.

### 12.1 Canvas and hierarchy

- White 16:9 or content-fitted canvas with at least 48px outer margin.
- Title at top left, 34–40px Noto Sans semibold, black/ink. Optional system label at top right in a blue-900 filled rounded rectangle with white text.
- Main flow reads top-to-bottom or left-to-right, never both without clearly separated lanes.
- Use titled dashed blue-500 boundaries for trust zones, verification stages or subsystems. A boundary title sits immediately above or below the boundary.

### 12.2 Shape grammar

| Meaning | Shape/style |
|---|---|
| start/end | dark-neutral filled circle; adjacent text label |
| portal/service/process | rounded rectangle, white with 2px blue outline; key entry node may be blue-900 filled |
| human action or controlled mutation | orange-700 filled rounded rectangle, white text |
| decision | white diamond, 2px blue outline; outgoing edges explicitly labelled |
| database/system of record | cylinder, white, 2px blue outline |
| external actor/channel | simple approved line icon plus text, or a labelled rounded rectangle |
| success/final state | blue-900 or success fill, according to the semantic legend |
| failure/rejected state | error outline/fill with text; never orange alone |
| connector | 1.5–2px blue-500 line with a filled arrowhead |

Node text is 18–22px on the master PNG/SVG; edge labels are 15–18px. Use short verb phrases. Avoid tiny technical annotations—put detail in a numbered callout or caption.

### 12.3 Layout rules

- Orthogonal connectors, visible arrowheads, minimal crossings. If a crossing is unavoidable, use a line jump or split the diagram.
- `Yes/No`, success/failure and synchronous/asynchronous paths are labelled next to the correct edge.
- Databases, queues, external providers and trust boundaries use distinct conventional shapes; do not represent everything as a rounded card.
- Include a compact legend when more than four semantics/colours appear.
- Use the same palette and shape semantics in ERDs, deployment diagrams and process flows. For ERDs, tables remain square/very lightly rounded boxes with blue headers; cardinality is explicit and relationship lines do not use process arrowheads.
- Export SVG as the canonical artifact, then PNG at 2× for documents. Provide a concise alt description and a nearby text equivalent in the owning Markdown file.
- Never put a real Aadhaar number, mobile number, family record or credential in a diagram. Synthetic values must be visibly synthetic.

## 13. Explicit anti-patterns

Do not ship any of the following:

- AI-generated people, fake government seals, invented partner logos, synthetic official portraits or unapproved emblem use;
- a giant slogan-led hero, floating orbit illustration, abstract blob/wave, glassmorphism, neon gradients or gratuitous animation;
- a grid where every piece of content is an identical rounded card;
- excessive white space that pushes the primary task or status below the fold;
- splash modals, automatic carousels, marquees, auto-playing video or accessibility overlays as a substitute for accessible code;
- leader portraits as decoration; use only when mandated by an authorised content owner and managed as editorial content;
- arbitrary stock photography, city skylines or Gujarat cultural motifs unrelated to a citizen task;
- unverified helplines, addresses, service centres, statistics, deadlines or claims of government approval;
- icon-only navigation, tiny low-contrast captions, all-caps paragraphs or placeholder-only forms;
- status dashboards that confuse application submission, verification, approval, issuance, payment and reversal;
- copying a legacy Gujarat or another state's visual skin merely because it is official.

## 14. Definition of done for the redesign

The redesign is ready for handoff only when all items below pass:

1. Approved bilingual name and owner line are used consistently; emblem/product mark is an authorised asset or intentionally omitted pending approval.
2. All public and authenticated pages use the same government shell and one primary blue group.
3. Home first viewport exposes Find, Apply, Update and Track plus an assisted-service route; no marketing hero/orbit remains.
4. Public notices/documents and policy/ownership footer are present with real metadata or an honest empty state.
5. Forms, receipts, citizen lists, staff queues and department tables follow Sections 8–9.
6. Gujarati and English routes/content have parity and pass layout checks.
7. Keyboard-only operation, screen-reader smoke tests, 320px/400% reflow, contrast, error recovery and reduced motion are tested and recorded.
8. No remote runtime font/image dependency, unapproved official mark, fake live record or invented contact appears.
9. Every SVG/PNG in `docs/graphs/` follows the supplied process-flow grammar and has a text equivalent.
10. Automated accessibility checks report no serious/critical findings on home, sign-in, application, receipt, citizen dashboard and staff case pages; manual checks are still recorded separately.

## 15. Source register

- Government of Gujarat, Mari Yojana: <https://mariyojana.gujarat.gov.in/Default.aspx>
- Gujarat Informatics Limited, Digital Gujarat project: <https://gil.gujarat.gov.in/digital_gujarat>
- Department of Science & Technology, Gujarat, projects and initiatives: <https://dst.gujarat.gov.in/Home/ProjectsandInitiatives>
- Directorate of ICT & e-Governance, Gujarat, accessibility features: <https://directorit.gujarat.gov.in/help>
- Ahmedabad District, Government of Gujarat: <https://ahmedabad.nic.in/>
- NIC/S3WaaS Gujarat district portal: <https://gujarat.s3waas.gov.in/>
- UP Family ID: <https://familyid.up.gov.in/portal/Home_en.aspx>
- Haryana Mera Parivar: <https://meraparivar.haryana.gov.in/>
- Rajasthan Jan Aadhaar: <https://janaadhaar.rajasthan.gov.in/>
- Guidelines for Indian Government Websites and Apps 3.0: <https://guidelines.india.gov.in/guidelines/>
- Digital Brand Identity Manual/toolkit: <https://dbimtoolkit.digifootprint.gov.in/>
- UX4G Design System 3.0 patterns: <https://www.ux4g.gov.in/patterns>

Research screenshots already retained in `docs/frontend-research/` are comparator evidence only. They are not approved artwork and must not be copied into production.
