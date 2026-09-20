"""Identity transport boundary; simulator never asserts government identity.

The application uses the same challenge UX in every environment. Substituting an
approved adapter requires a provider implementation and security integration tests;
setting an unimplemented provider deliberately does not fall back to simulation.
"""
from fastapi import HTTPException
from . import config

class SimulatedIdentityProvider:
    name = "simulated"
    delivery_mode = "simulated"
    expires_in = 300
    resend_after = 30

    def issue_code(self):
        return "123456"

def provider():
    if not config.DEMO_MODE or config.IDENTITY_PROVIDER != "simulated":
        raise HTTPException(503, "The approved identity delivery provider is not configured")
    return SimulatedIdentityProvider()
