# Local service walkthrough

Use only synthetic data at http://127.0.0.1:8095. Gujarati is the default; the language control preserves the current route. This is the normal service UI, with a clearly identified test provider. It does not collect a genuine Aadhaar number or move money.

## 1. Explore the public service

Open the homepage, Family services, About, help/FAQ, schemes, accessibility and privacy pages. Use the language toggle, text-size/contrast controls and keyboard skip link. The scheme catalogue separates informational schemes from services connected in this installation; a catalogue entry does not promise eligibility or a payable entitlement. Unapproved real helplines, officials' portraits and state emblems are not fabricated.

## 2. Resident family and privacy

Sign in with `9000000001` and one-time code `123456`. Open My family, member details, benefit history, payments, notifications and access history. `GKS-DEMO-AHMEDABAD-001` is an intentionally synthetic government-style reference, not a valid government identity credential. The account can see its own and authorized represented-minor benefit information, not every adult's private records merely because they share a family.

Sign out and use `9000000003` to see a separate Surat family. Changing a URL must not provide access to another family or their application/evidence/payment.

## 3. Submit a new family registration

Choose **Create an account**, supply a made-up name/mobile and verify with `123456`. Choose Apply for Family ID → **No ration card**. Complete applicant details, Ahmedabad address and a member (self; valid past birth date). Additional members can be added in the form. Save/continue between steps; refresh to show the saved server draft. Review the declarations and submit. The receipt receives an application reference; it is not yet a permanent Family ID.

The ration-card/unsure routes explain the source boundary. A synthetic reference check is not an actual PDS database connection. No identity-document upload is mandatory to claim a successful unapproved Aadhaar workflow. Uploaded evidence, if exercised, remains quarantined and cannot be downloaded until a real scanning/release workflow is implemented.

## 4. Independent review and issue

In separate sessions, use Staff access:

1. `verifier@demo.local`: locate the case, start review and verify with a reason. Alternatively request information or reject, keeping a reasoned history.
2. `approver@demo.local`: inspect the verified case and approve with a reason.
3. Resident: refresh the application timeline and My family. Approval and implementation are distinct history events; successful implementation produces the permanent synthetic family reference and membership.

Mobile `9000000004` has initial submitted reference `APP-DEMO-PENDING-001` for a short review demonstration, unless a previous run already processed it. The operator performs assisted intake with an intended resident account and authority declaration; they do not impersonate a verifier/approver.

## 5. Correction lifecycle

From the resident Family services workspace request an address correction. Compare the current and proposed value, submit, and repeat independent verification/approval. The existing registry must remain unchanged before implementation. The application and fact history retain the change reason and actor.

Supported local corrections are address, name, represented minor child/grandchild addition, death recording and representative change. Split/merge/transfer, adult authorization and complex deceased-representative exceptions are deliberately not presented as available completed services. If staff request information, the resident can edit the returned request and resubmit.

## 6. Scheme, sanction and synthetic payment

From a connected scheme, send a resident referral. This is a request for departmental review, not automatic eligibility/approval. Staff access as `department@demo.local`, inspect scheme applications and sanction with a positive amount, period and recorded reason, or reject with a reason. The officer's scheme grant limits their access.

Open the payment workspace, process using the synthetic provider: exercise failure, retry/paid, then reversal if appropriate. The provider-specific test outcome is visible only in test mode. The order/event history and resident payment/benefit view must agree; a reversal retains the earlier events. **No money is transferred.** Family registration does not invent a payment fee.

## 7. Grievance and administration

Resident submits a grievance and tracks its reference. Authorized staff move it through review and resolution with a response. Privacy/staff-conduct cases are restricted to their owner and administrator, not the ordinary district queue. Administrator can manage catalogue/content revisions, inspect operational/audit counters and approve or revoke purpose-scoped department clients. Admin is not a substitute for the independent verification/approval roles.

## 8. Persistence

Run `bash scripts/local.sh restart` and refresh a saved draft/application/payment: the same records remain. Stop/start does not reset the database. `npm run backup` creates a private synthetic PostgreSQL/evidence backup under `.local/backups/`.
