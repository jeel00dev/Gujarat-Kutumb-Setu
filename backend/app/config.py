"""No real identity/integration is enabled by these demonstration defaults."""
import os
from pathlib import Path

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://kutumb:kutumb_demo_password@localhost:55432/kutumb")
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
IDENTITY_PROVIDER = os.getenv("IDENTITY_PROVIDER", "simulated")
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
SESSION_HOURS = 8
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/tmp/kutumb-demo-evidence"))
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
ALLOWED_ORIGINS = set(os.getenv("ALLOWED_ORIGINS", "http://localhost:8095,http://127.0.0.1:8095,http://localhost:8005,http://127.0.0.1:8005,http://localhost:5173,http://127.0.0.1:5173").split(","))
ALLOWED_ORIGINS.update({"http://localhost:5175", "http://127.0.0.1:5175"})
POLICY_VERSION = "demo-policy-1"
SUPPORTED_DISTRICTS = {"Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Kutch", "Bhavnagar", "Jamnagar", "Anand", "Mehsana", "Bharuch", "Navsari", "Patan", "Valsad", "Banaskantha", "Sabarkantha", "Aravalli", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gir Somnath", "Junagadh", "Kheda", "Mahisagar", "Morbi", "Narmada", "Panchmahal", "Porbandar", "Surendranagar", "Tapi", "Amreli"}
SUPPORTED_DISTRICTS.add("Vav-Tharad")
