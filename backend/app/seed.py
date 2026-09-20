"""Idempotent synthetic fixtures; never drop, reset or overwrite resident records."""
from datetime import date
from sqlalchemy import select
from . import config, models as m, services as v
from .db import SessionLocal
from .security import password_hash, digest

ACCOUNTS = [
    ("resident@demo.local", "Mihir Patel", "resident", "Ahmedabad"),
    ("new.resident@demo.local", "Kavya Shah", "resident", "Ahmedabad"),
    ("other.resident@demo.local", "Hetal Desai", "resident", "Surat"),
    ("pending.resident@demo.local", "Dhruv Mehta", "resident", "Ahmedabad"),
    ("operator@demo.local", "Assisted service operator", "operator", "Ahmedabad"),
    ("verifier@demo.local", "Ahmedabad verification officer", "verifier", "Ahmedabad"),
    ("approver@demo.local", "Ahmedabad approving officer", "approver", "Ahmedabad"),
    ("admin@demo.local", "Programme administrator", "admin", None),
    ("department@demo.local", "Service department officer", "department", "Ahmedabad"),
]

SCHEMES = [
    {"slug": "family-services-assistance", "name": "Family Services Assistance", "name_gu": "પરિવાર સેવા સહાય", "category": "Family welfare", "department": "Kutumb Setu Service Department", "summary": "Apply for family service assistance and track departmental review, sanction and payment status. This testing environment uses synthetic decisions and a simulated payment provider; it does not describe an approved Gujarat cash entitlement.", "summary_gu": "પરિવાર સેવા સહાય માટે અરજી કરો અને વિભાગીય સમીક્ષા, મંજૂરી અને ચુકવણીની સ્થિતિ જુઓ. પરીક્ષણમાં કૃત્રિમ નિર્ણયો અને ચુકવણી પ્રદાતાનો ઉપયોગ થાય છે; આ ગુજરાતની મંજૂર રોકડ યોજનાનો દાવો નથી.", "benefit_type": "cash", "eligibility": ["An active family registry account is required to send a request.", "A service department officer independently reviews the request.", "Testing fixtures only; no actual government entitlement or money transfer."], "documents": ["No supporting document is required by this synthetic service."], "source_url": "https://mariyojana.gujarat.gov.in/", "status": "published", "capability": "demo_connected"},
    {"slug": "vahali-dikari", "name": "Vahali Dikari Yojana", "name_gu": "વ્હાલી દીકરી યોજના", "category": "Women and child development", "department": "Women and Child Development, Gujarat", "summary": "Read the official Gujarat department guidance for this girl-child welfare scheme. Eligibility, application documents and financial conditions must be checked with the owning department; Family ID alone does not establish entitlement.", "summary_gu": "બાળિકાઓ માટેની આ કલ્યાણ યોજનાની સત્તાવાર વિભાગીય માહિતી વાંચો. પાત્રતા, દસ્તાવેજો અને નાણાકીય શરતો માટે સંબંધિત વિભાગનો સંપર્ક કરો. માત્ર પરિવાર ઓળખથી પાત્રતા મળતી નથી.", "benefit_type": "cash", "eligibility": ["See the current Women and Child Development department guidance."], "documents": ["Use the department's current document checklist."], "application_url": "https://wcd.gujarat.gov.in/", "source_url": "https://wcd.gujarat.gov.in/", "status": "published", "capability": "external"},
    {"slug": "mukhyamantri-matrushakti", "name": "Mukhyamantri Matrushakti Yojana", "name_gu": "મુખ્યમંત્રી માતૃશક્તિ યોજના", "category": "Women and child development", "department": "Women and Child Development, Gujarat", "summary": "Official information about maternal and child nutrition support. The department confirms current coverage, documents and service route. No pregnancy or clinical details are collected in the family registry.", "summary_gu": "માતા અને બાળકના પોષણ સહાય વિશે સત્તાવાર માહિતી. વર્તમાન પાત્રતા, દસ્તાવેજો અને સેવા માટે વિભાગની સૂચનાઓ અનુસરો. પરિવાર નોંધણીમાં તબીબી વિગતો લેવામાં આવતી નથી.", "benefit_type": "in_kind", "eligibility": ["Check current department criteria and contact the approved service centre."], "documents": ["Refer to the current department instructions."], "application_url": "https://wcd.gujarat.gov.in/initiativedetails?id=292", "source_url": "https://wcd.gujarat.gov.in/initiativedetails?id=292", "status": "published", "capability": "external"},
    {"slug": "ganga-swarupa-assistance", "name": "Ganga Swarupa Economic Assistance", "name_gu": "ગંગા સ્વરૂપા આર્થિક સહાય યોજના", "category": "Social security", "department": "Women and Child Development, Gujarat", "summary": "Department-owned assistance information and application guidance. The owning authority decides eligibility and any payment. Scheme discovery here is not a sanction or complete benefit statement.", "summary_gu": "વિભાગની સહાય યોજના અને અરજી વિશે માહિતી મેળવો. સંબંધિત અધિકારી પાત્રતા અને ચુકવણીનો નિર્ણય કરે છે. અહીં યોજના દેખાવાનો અર્થ મંજૂરી નથી.", "benefit_type": "cash", "eligibility": ["Consult the current official criteria and local authorized office."], "documents": ["See the department's application instructions."], "application_url": "https://wcd.gujarat.gov.in/initiativedetails?id=231", "source_url": "https://wcd.gujarat.gov.in/initiativedetails?id=231", "status": "published", "capability": "external"},
    {"slug": "sant-surdas", "name": "Sant Surdas Yojana", "name_gu": "સંત સુરદાસ યોજના", "category": "Disability support", "department": "Social Justice and Empowerment, Gujarat", "summary": "Official disability-support scheme information. Consult the current department rulebook and approved application channel. A family identity record does not infer disability or issue a certificate.", "summary_gu": "દિવ્યાંગ સહાય યોજના વિશે સત્તાવાર માહિતી. વર્તમાન નિયમો અને અરજી માટે વિભાગીય માર્ગદર્શન જુઓ. પરિવાર ઓળખથી દિવ્યાંગતાનું પ્રમાણપત્ર બનતું નથી.", "benefit_type": "cash", "eligibility": ["Current programme conditions are established by the scheme-owning department."], "documents": ["Refer to the official current checklist; do not upload certificates into an unrelated family form."], "application_url": "https://esamajkalyan.gujarat.gov.in/", "source_url": "https://sje.gujarat.gov.in/dsd/scheme/sant-surdash-yojana?lang=english", "status": "published", "capability": "external"},
    {"slug": "digital-gujarat-scholarships", "name": "Digital Gujarat Scholarship Services", "name_gu": "ડિજિટલ ગુજરાત શિષ્યવૃત્તિ સેવાઓ", "category": "Education", "department": "Relevant scholarship departments, Gujarat", "summary": "Find student-specific scholarship services through Digital Gujarat. The applicable scholarship department owns course, income, category and academic-year rules; household membership is not a scholarship approval.", "summary_gu": "ડિજિટલ ગુજરાત પર વિદ્યાર્થી માટે શિષ્યવૃત્તિ સેવાઓ શોધો. અભ્યાસક્રમ, આવક અને શૈક્ષણિક વર્ષના નિયમો સંબંધિત વિભાગ નક્કી કરે છે. પરિવાર સભ્યપદ શિષ્યવૃત્તિની મંજૂરી નથી.", "benefit_type": "cash", "eligibility": ["Select the appropriate current scholarship and academic year on Digital Gujarat."], "documents": ["Use the scholarship owner's current checklist."], "application_url": "https://www.digitalgujarat.gov.in/", "source_url": "https://dst.gujarat.gov.in/Home/ProjectsandInitiatives", "status": "published", "capability": "external"},
    {"slug": "ikhedut-services", "name": "iKhedut Agricultural Services", "name_gu": "આઈ-ખેડૂત કૃષિ સેવાઓ", "category": "Agriculture", "department": "Agriculture and associated departments, Gujarat", "summary": "Open the official iKhedut portal to view current agricultural services, application windows and instructions. Family ID does not create land ownership or loan entitlement.", "summary_gu": "વર્તમાન કૃષિ સેવાઓ, અરજીનો સમય અને સૂચનાઓ માટે સત્તાવાર આઈ-ખેડૂત પોર્ટલ જુઓ. પરિવાર ઓળખથી જમીનની માલિકી કે લોનની પાત્રતા બનતી નથી.", "benefit_type": "service", "eligibility": ["Consult the current scheme and application window on the official portal."], "documents": ["Use the selected scheme's official checklist."], "application_url": "https://ikhedut.gujarat.gov.in/", "source_url": "https://ikhedut.gujarat.gov.in/", "status": "published", "capability": "external"},
]

CONTENT = [
    ("about", "About Gujarat Kutumb Setu", "ગુજરાત કુટુંબ સેતુ વિશે", "Gujarat Kutumb Setu connects a family's registry identity with purpose-limited government-service discovery and requests. Person identities remain stable across supported changes. Registration is distinct from ration entitlement, citizenship, domicile or scheme eligibility. This local testing environment uses synthetic data and simulated identity/payment providers; no government database is connected.", "ગુજરાત કુટુંબ સેતુ પરિવારની નોંધણી ઓળખને સંબંધિત સેવાઓની માહિતી અને અરજીઓ સાથે જોડે છે. નોંધણીથી રેશન, નાગરિકતા, રહેઠાણ અથવા યોજનાની પાત્રતા આપોઆપ મળતી નથી. આ સ્થાનિક પરીક્ષણમાં કૃત્રિમ માહિતી અને સિમ્યુલેટેડ ઓળખ તથા ચુકવણી પ્રદાતા છે; સરકારી ડેટાબેઝ જોડાયેલો નથી."),
    ("help", "Help and frequently asked questions", "મદદ અને વારંવાર પૂછાતા પ્રશ્નો", "Start with an existing Family ID or your registered mobile. No ration card? Choose the no-ration route. Save each enrollment step and review before submission. A saved draft is not submitted. Track your reference in My applications. Corrections need verification and approval. If you cannot use a mobile or need representation support, contact the programme's approved assisted-service channel when operational. No public helpline or physical centre is claimed in this testing environment.", "હાલની પરિવાર ઓળખ અથવા નોંધાયેલ મોબાઇલથી શરૂ કરો. રેશન કાર્ડ નથી? રેશન વગરનો વિકલ્પ પસંદ કરો. દરેક પગલું સાચવો અને સબમિટ કરતા પહેલાં તપાસો. સાચવેલી અરજી સબમિટ થયેલી નથી. મારી અરજીઓમાં સ્થિતિ જુઓ. સુધારા માટે ચકાસણી અને મંજૂરી જરૂરી છે. મોબાઇલ અથવા પ્રતિનિધિત્વ સહાય માટે કાર્યરત થયા પછી મંજૂર સહાય કેન્દ્રનો સંપર્ક કરો. આ પરીક્ષણમાં જાહેર હેલ્પલાઇન કે વાસ્તવિક કેન્દ્રનો દાવો નથી."),
    ("accessibility", "Accessibility", "સુલભતા", "Use the language switch to choose Gujarati or English. All principal journeys support keyboard navigation, labelled controls and visible focus. Browser zoom and text resizing are supported. If a field cannot be completed, the page identifies it and preserves the draft. Accessibility is an engineering target, not a claim of GIGW/STQC certification. Report a barrier through the grievance form with the page and problem; do not include sensitive identity documents.", "ગુજરાતી અથવા અંગ્રેજી પસંદ કરવા ભાષા વિકલ્પ વાપરો. મુખ્ય સેવાઓમાં કીબોર્ડ, સ્પષ્ટ લેબલ અને ફોકસનો આધાર છે. બ્રાઉઝર ઝૂમ અને અક્ષરનું કદ વધારી શકો છો. ભૂલ બતાવતી વખતે અરજી સાચવી રાખવામાં આવે છે. આ સુલભતા માટેનો પ્રયાસ છે, પ્રમાણપત્રનો દાવો નથી. સમસ્યા જણાવવા ફરિયાદ ફોર્મ વાપરો; સંવેદનશીલ ઓળખ દસ્તાવેજ ન મોકલો."),
    ("privacy", "Privacy and your records", "ગોપનીયતા અને તમારી નોંધો", "The registry collects the minimum fields in its approved workflow. This test version accepts only synthetic personal information and does not collect Aadhaar, bank, caste, religion or clinical data. A contact phone is not a unique person identity. Family membership does not allow one adult to view another adult's restricted benefit history. Access and changes are recorded. Department clients require purpose, scope and jurisdiction approval. You can view your access history and raise a privacy grievance. Production retention, lawful basis and rights contacts require government approval.", "નોંધણીમાં જરૂરી ઓછામાં ઓછી માહિતી લેવામાં આવે છે. આ પરીક્ષણમાં માત્ર કૃત્રિમ માહિતી આપો; આધાર, બેંક, જાતિ, ધર્મ અથવા તબીબી માહિતી લેવામાં આવતી નથી. સંપર્ક નંબર વ્યક્તિની અનન્ય ઓળખ નથી. પરિવારના એક પુખ્ત સભ્યને બીજા પુખ્ત સભ્યના ખાનગી લાભ જોવા આપોઆપ અધિકાર મળતો નથી. માહિતીના ઉપયોગ અને ફેરફારોની નોંધ થાય છે. વિભાગોને હેતુ અને અધિકારની મંજૂરી જરૂરી છે. ઉપયોગ ઇતિહાસ જુઓ અને ગોપનીયતા ફરિયાદ કરો. વાસ્તવિક ઉપયોગ માટે જાળવણી અને કાનૂની આધારની સરકારી મંજૂરી જરૂરી છે."),
    ("terms", "Terms of use", "ઉપયોગની શરતો", "Provide accurate information and submit only records you are authorized to manage. Do not enter real sensitive information into this testing environment. Submission is an acknowledgment, not a government award. References to real schemes direct you to official owning departments; rules may change. Connected test-service decisions and payments are simulated and never move real funds. Live use requires approved identity, policy, security, accessibility and hosting controls.", "સાચી માહિતી આપો અને માત્ર અધિકૃત નોંધો જ સંભાળો. આ પરીક્ષણમાં વાસ્તવિક સંવેદનશીલ માહિતી ન આપો. સબમિશન સ્વીકારનો પુરાવો છે, સરકારી લાભની મંજૂરી નથી. વાસ્તવિક યોજનાઓ માટે સત્તાવાર વિભાગની સૂચનાઓ જુઓ. પરીક્ષણની ચુકવણીમાં વાસ્તવિક નાણાં ખસતા નથી. જાહેર ઉપયોગ પહેલાં મંજૂર ઓળખ, નીતિ, સુરક્ષા અને હોસ્ટિંગ જરૂરી છે."),
    ("services", "Services and process", "સેવાઓ અને પ્રક્રિયા", "Apply or resume a family registration, track status, request a supported correction, view authorized benefit history, discover schemes and raise a grievance. A verifier examines a submitted request; a different approver decides it. A Family ID is issued only when approval and registry implementation complete. Supported corrections include address, your own or represented minor's name, represented minor addition, death and representative change. Transfer, split, merge and source-data disputes require expanded authorized workflows before public use.", "પરિવાર નોંધણી કરો અથવા ચાલુ રાખો, સ્થિતિ જુઓ, સુધારો માગો, અધિકૃત લાભ ઇતિહાસ જુઓ, યોજનાઓ શોધો અને ફરિયાદ કરો. ચકાસણી અધિકારી અને મંજૂરી અધિકારી અલગ છે. મંજૂરી અને નોંધણી અમલ પછી જ પરિવાર ઓળખ બને છે. સરનામું, પોતાનું અથવા અધિકૃત બાળકનું નામ, બાળક ઉમેરવું, મૃત્યુ અને પ્રતિનિધિ ફેરફાર જેવી સેવાઓ ઉપલબ્ધ છે. સ્થળાંતર, વિભાજન અને વિવાદ માટે વિસ્તૃત મંજૂર પ્રક્રિયા જરૂરી છે."),
    ("contact", "Contact and assistance", "સંપર્ક અને સહાય", "Use the signed-in grievance form for an application, correction, benefit or privacy concern. Staff-conduct and privacy complaints are restricted to independent administration review. Include the relevant application reference but never a password, OTP, Aadhaar or bank account. A real nodal office, official helpline, service-centre directory and hours must be published by the government before public launch. The local testing desk is not a functioning public counter.", "અરજી, સુધારો, લાભ અથવા ગોપનીયતા માટે સાઇન ઇન કરીને ફરિયાદ કરો. કર્મચારી વર્તન અને ગોપનીયતા ફરિયાદ સ્વતંત્ર વહીવટી અધિકારી જ તપાસે છે. અરજીનો સંદર્ભ આપો પરંતુ પાસવર્ડ, ઓટીપી, આધાર કે બેંક માહિતી ન આપો. જાહેર શરૂઆત પહેલાં સરકાર સત્તાવાર કચેરી, હેલ્પલાઇન અને સેવા કેન્દ્રની માહિતી પ્રકાશિત કરશે. સ્થાનિક પરીક્ષણ કેન્દ્ર વાસ્તવિક જાહેર કાઉન્ટર નથી."),
]

def seed(db):
    if not config.DEMO_MODE:
        raise RuntimeError("Synthetic seeding is forbidden when DEMO_MODE=false")
    users = {}
    for email, name, role, district in ACCOUNTS:
        user = db.scalar(select(m.User).where(m.User.email == email))
        if not user:
            user = m.User(email=email, display_name=name, role=role, district=district, password_hash=password_hash("DemoPass@123!"))
            db.add(user)
            db.flush()
        users[email] = user
    for index, email in enumerate(["resident@demo.local", "new.resident@demo.local", "other.resident@demo.local", "pending.resident@demo.local"], 1):
        mobile = f"900000000{index}"
        if not db.scalar(select(m.AuthIdentifier.id).where(m.AuthIdentifier.identifier_hash == digest(mobile))):
            db.add(m.AuthIdentifier(user_id=users[email].id, identifier_hash=digest(mobile), identifier_type="mobile", masked_destination=f"******{mobile[-4:]}"))
    for email, public_id, member_data, address in [
        ("resident@demo.local", "GKS-DEMO-AHMEDABAD-001", [("Mihir Patel", "મિહિર પટેલ", "1987-03-15", "self"), ("Nisha Patel", "નિશા પટેલ", "1990-07-22", "spouse"), ("Aarav Patel", "આરવ પટેલ", "2017-04-08", "child")], {"address_line": "12, Synthetic Shantivan Society", "locality": "Navrangpura", "taluka": "Ahmedabad City", "district": "Ahmedabad", "pincode": "380009"}),
        ("other.resident@demo.local", "GKS-DEMO-SURAT-002", [("Hetal Desai", "હેતલ દેસાઈ", "1989-06-12", "self")], {"address_line": "7, Synthetic River View", "locality": "Adajan", "taluka": "Surat City", "district": "Surat", "pincode": "395009"}),
    ]:
        user = users[email]
        family = db.scalar(select(m.Family).where(m.Family.public_id == public_id))
        if not family:
            family = m.Family(public_id=public_id, district=address["district"], address=address)
            db.add(family)
            db.flush()
            persons = []
            for index, (name, name_gu, dob, relationship) in enumerate(member_data, 1):
                person = m.Person(public_id=f"GKP-DEMO-{family.district.upper()}-{index:03}", name=name, name_gu=name_gu, dob=date.fromisoformat(dob))
                db.add(person)
                db.flush()
                db.add(m.Membership(family_id=family.id, person_id=person.id, relationship=relationship))
                persons.append((person, relationship))
                if relationship == "self":
                    user.person_id = person.id
                    db.add(m.Representative(family_id=family.id, person_id=person.id))
            for person, relationship in persons:
                if relationship == "child":
                    v.minor_representation(db, user.person_id, person)
            v.notify(db, user.id, "Family record available", "Your registered family is available. Review its members and use a change request for corrections.", "/my/family")
        if not db.scalar(select(m.AuthIdentifier.id).where(m.AuthIdentifier.identifier_hash == digest(public_id))):
            db.add(m.AuthIdentifier(user_id=user.id, identifier_hash=digest(public_id), identifier_type="family_id", masked_destination="******0001" if family.district == "Ahmedabad" else "******0003"))
    for values in SCHEMES:
        if not db.scalar(select(m.Scheme.id).where(m.Scheme.slug == values["slug"])):
            db.add(m.Scheme(**values))
    for slug, title, title_gu, body, body_gu in CONTENT:
        if not db.get(m.Content, slug):
            db.add(m.Content(slug=slug, title=title, title_gu=title_gu, body=body, body_gu=body_gu))
    db.flush()
    scheme = db.scalar(select(m.Scheme).where(m.Scheme.slug == "family-services-assistance"))
    family = v.family_for_user(db, users["resident@demo.local"])
    for person, membership in v.active_members(db, family.id):
        source = f"SYNTHETIC-FIXTURE-{person.public_id}"
        if not db.scalar(select(m.Benefit.id).where(m.Benefit.source_reference == source)):
            db.add(m.Benefit(person_id=person.id, scheme_id=scheme.id, department=scheme.department, benefit_type="in_kind", quantity=1, unit="service kit", period="2026-09", status="issued", source_reference=source, event_date=date(2026, 9, 1)))
    db.flush()
    pending_owner = users["pending.resident@demo.local"]
    if not db.scalar(select(m.Application.id).where(m.Application.reference == "APP-DEMO-PENDING-001")) and not v.family_for_user(db, pending_owner):
        pending = m.Application(owner_id=pending_owner.id, submitted_by=pending_owner.id, kind="enrollment", branch="no_ration", district="Ahmedabad", step=6, reference="APP-DEMO-PENDING-001", payload={"applicant": {"name": "Dhruv Mehta", "name_gu": "ધ્રુવ મહેતા", "phone": "9000000004"}, "address": {"address_line": "28, Synthetic Gulmohar Society", "locality": "Paldi", "taluka": "Ahmedabad City", "district": "Ahmedabad", "pincode": "380007"}, "members": [{"client_id": "pending-self", "name": "Dhruv Mehta", "name_gu": "ધ્રુવ મહેતા", "dob": "1988-11-02", "relationship": "self"}, {"client_id": "pending-child", "name": "Diya Mehta", "name_gu": "દિયા મહેતા", "dob": "2019-03-20", "relationship": "child"}], "declarations": {"accuracy": True, "authority": True}})
        db.add(pending)
        db.flush()
        v.submit_application(db, pending, pending_owner, pending.revision)
    from .payments import seed_payments
    seed_payments(db)
    db.flush()

if __name__ == "__main__":
    with SessionLocal.begin() as db:
        seed(db)
    print("Synthetic fixtures ready. Existing records were preserved.")
