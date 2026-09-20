from datetime import date
from typing import Literal
import re
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from .config import SUPPORTED_DISTRICTS

class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

class Login(StrictModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def email_format(cls, value):
        value = value.lower()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise ValueError("Enter a valid email address")
        return value

class Register(Login):
    password: str = Field(min_length=12, max_length=128)
    display_name: str = Field(min_length=1, max_length=150)
    language: Literal["en", "gu"] = "en"

class ChallengeCreate(StrictModel):
    identifier: str = Field(min_length=3, max_length=80)
    purpose: Literal["sign_in", "register"]
    display_name: str | None = Field(default=None, min_length=2, max_length=150)
    language: Literal["en", "gu"] = "en"

class ChallengeVerify(StrictModel):
    challenge_id: str = Field(max_length=36)
    code: str = Field(pattern=r"^[0-9]{6}$")

class Address(StrictModel):
    address_line: str = Field(min_length=3, max_length=250)
    locality: str = Field(min_length=2, max_length=120)
    taluka: str = Field(min_length=2, max_length=100)
    district: str = Field(min_length=2, max_length=60)
    pincode: str = Field(pattern=r"^[1-9][0-9]{5}$")

    @field_validator("district")
    @classmethod
    def district_supported(cls, value):
        if value not in SUPPORTED_DISTRICTS:
            raise ValueError("Choose a supported Gujarat district")
        return value

class Applicant(StrictModel):
    name: str = Field(min_length=1, max_length=150)
    name_gu: str = Field(default="", max_length=150)
    phone: str = Field(default="", max_length=15)

    @field_validator("phone")
    @classmethod
    def phone_optional(cls, value):
        if value and not re.fullmatch(r"[6-9][0-9]{9}", value):
            raise ValueError("Use a ten digit contact number, or leave it blank for assisted contact")
        return value

class Member(StrictModel):
    client_id: str = Field(default="", max_length=80)
    name: str = Field(min_length=1, max_length=150)
    name_gu: str = Field(default="", max_length=150)
    dob: date
    relationship: Literal["self", "spouse", "child", "parent", "sibling", "grandparent", "grandchild", "guardian", "other"]

    @field_validator("dob")
    @classmethod
    def birth_date(cls, value):
        if value > date.today() or value < date(1900, 1, 1):
            raise ValueError("Date of birth must be between 1900-01-01 and today")
        return value

class Declarations(StrictModel):
    accuracy: Literal[True]
    authority: Literal[True]

class Enrollment(StrictModel):
    applicant: Applicant
    address: Address
    members: list[Member] = Field(min_length=1, max_length=30)
    declarations: Declarations

    @model_validator(mode="after")
    def coherent_members(self):
        selves = [m for m in self.members if m.relationship == "self"]
        if len(selves) != 1:
            raise ValueError("Exactly one member must be the applicant (self)")
        born = selves[0].dob
        age = date.today().year - born.year - ((date.today().month, date.today().day) < (born.month, born.day))
        if age < 18:
            raise ValueError("A minor needs an authorized adult representative; contact assisted support")
        if self.applicant.name.casefold() != selves[0].name.casefold():
            raise ValueError("Applicant name must match the self member")
        ids = [m.client_id for m in self.members if m.client_id]
        if len(ids) != len(set(ids)):
            raise ValueError("Member client IDs must be unique")
        signatures = [(m.name.casefold(), m.dob) for m in self.members]
        if len(signatures) != len(set(signatures)):
            raise ValueError("Potential repeated member: review names and birth dates before submitting")
        return self

class ApplicationCreate(StrictModel):
    kind: Literal["enrollment"] = "enrollment"
    branch: Literal["no_ration", "ration", "unsure"] = "no_ration"
    district: str = "Ahmedabad"
    payload: dict = Field(default_factory=dict)
    step: int = Field(default=1, ge=1, le=6)
    owner_email: str | None = Field(default=None, max_length=254)
    assisted_authority: str | None = Field(default=None, max_length=500)

class ApplicationPatch(StrictModel):
    revision: int = Field(ge=1)
    payload: dict
    step: int = Field(ge=1, le=6)
    district: str | None = None

class Revision(StrictModel):
    revision: int = Field(ge=1)

class Reason(Revision):
    reason: str = Field(min_length=5, max_length=2000)

class ReviewAction(Reason):
    action: Literal["start_review", "request_information", "verify", "approve", "reject"]

class ChangeCreate(StrictModel):
    family_id: str = Field(min_length=1, max_length=36)
    change_type: Literal["address", "name", "add_member", "death", "representative"]
    payload: dict

class NameChange(StrictModel):
    person_id: str = Field(max_length=36)
    name: str = Field(min_length=1, max_length=150)
    name_gu: str = Field(default="", max_length=150)

class AddressChange(StrictModel):
    address: Address

class MemberChange(StrictModel):
    member: Member

class DeathChange(StrictModel):
    person_id: str = Field(max_length=36)
    effective_date: date

class RepresentativeChange(StrictModel):
    person_id: str = Field(max_length=36)

class RegistryCheck(StrictModel):
    reference: str = Field(min_length=3, max_length=80)

class GrievanceCreate(StrictModel):
    category: Literal["application", "correction", "privacy", "benefit", "staff_conduct", "technical", "other"]
    subject: str = Field(min_length=5, max_length=180)
    description: str = Field(min_length=10, max_length=5000)
    application_id: str | None = Field(default=None, max_length=36)

class GrievanceAction(StrictModel):
    status: Literal["in_review", "resolved", "reopened"]
    response: str = Field(min_length=10, max_length=5000)

class ReferralCreate(StrictModel):
    scheme_id: str = Field(max_length=36)
    consent: Literal[True]

class ContentUpdate(Revision):
    title: str = Field(min_length=2, max_length=180)
    title_gu: str = Field(min_length=2, max_length=180)
    body: str = Field(min_length=10, max_length=30000)
    body_gu: str = Field(min_length=10, max_length=30000)

class SchemeCreate(StrictModel):
    slug: str = Field(pattern=r"^[a-z][a-z0-9-]{2,99}$")
    name: str = Field(min_length=3, max_length=180)
    name_gu: str = Field(min_length=3, max_length=180)
    category: str = Field(min_length=2, max_length=60)
    department: str = Field(min_length=3, max_length=180)
    summary: str = Field(min_length=10, max_length=5000)
    summary_gu: str = Field(min_length=10, max_length=5000)
    benefit_type: Literal["service", "in_kind", "cash"] = "service"
    eligibility: list[str] = Field(default_factory=list, max_length=30)
    documents: list[str] = Field(default_factory=list, max_length=30)
    application_url: str | None = Field(default=None, max_length=1000)
    source_url: str = Field(max_length=1000)
    status: Literal["draft", "published", "suspended", "retired"] = "draft"
    capability: Literal["information_only", "external", "demo_connected"] = "information_only"

    @model_validator(mode="after")
    def safe_scheme(self):
        from urllib.parse import urlparse
        for url in [self.source_url, self.application_url]:
            if url:
                parsed = urlparse(url)
                if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
                    raise ValueError("Source and application links must be public HTTPS URLs")
        if self.capability == "external" and not self.application_url:
            raise ValueError("External schemes require an application link")
        return self

class SchemePatch(StrictModel):
    revision: int = Field(ge=1)
    slug: str | None = None
    name: str | None = None
    name_gu: str | None = None
    category: str | None = None
    department: str | None = None
    summary: str | None = None
    summary_gu: str | None = None
    benefit_type: str | None = None
    eligibility: list[str] | None = None
    documents: list[str] | None = None
    application_url: str | None = None
    source_url: str | None = None
    status: str | None = None
    capability: str | None = None

class ClientCreate(StrictModel):
    name: str = Field(min_length=3, max_length=150)
    purpose: str = Field(min_length=10, max_length=300)
    requested_scopes: list[Literal["family:verify", "benefits:write"]] = Field(min_length=1, max_length=2)

class ClientApproval(StrictModel):
    approved_scopes: list[Literal["family:verify", "benefits:write"]] | None = None
    approved_scheme_ids: list[str] = Field(default_factory=list, max_length=50)

class IntegrationResolve(StrictModel):
    public_id: str = Field(min_length=3, max_length=40)
    purpose: str = Field(min_length=10, max_length=300)

class BenefitReport(StrictModel):
    person_id: str = Field(max_length=36)
    scheme_id: str = Field(max_length=36)
    source_reference: str = Field(min_length=3, max_length=100)
    benefit_type: Literal["cash", "in_kind", "service"]
    amount: float | None = Field(default=None, ge=0, le=100000000)
    currency: Literal["INR"] | None = None
    quantity: float | None = Field(default=None, ge=0, le=1000000)
    unit: str | None = Field(default=None, max_length=40)
    period: str = Field(min_length=4, max_length=50)
    status: Literal["reported", "issued", "paid", "failed", "reversed"]
    event_date: date

    @model_validator(mode="after")
    def typed_benefit(self):
        if self.event_date > date.today():
            raise ValueError("Reported event cannot be in the future")
        if self.benefit_type == "cash" and (self.amount is None or self.currency is None):
            raise ValueError("A cash report requires amount and currency")
        if self.benefit_type != "cash" and (self.amount is not None or self.currency is not None):
            raise ValueError("Only cash events may carry an amount or currency")
        if self.benefit_type == "in_kind" and (not self.quantity or not self.unit):
            raise ValueError("In-kind reports require a positive quantity and unit")
        return self
