import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, get_db
from app import security, worker, config
from app.seed import seed

@pytest.fixture
def environment(tmp_path, monkeypatch):
    engine = create_engine(f"sqlite:///{tmp_path / 'test.sqlite'}", connect_args={"check_same_thread": False})
    @event.listens_for(engine, "connect")
    def foreign_keys(connection, _):
        connection.execute("PRAGMA foreign_keys=ON")
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    with factory.begin() as db:
        seed(db)
    def test_db():
        with factory() as db:
            try:
                yield db
                db.commit()
            except Exception:
                db.rollback()
                raise
    app.dependency_overrides[get_db] = test_db
    monkeypatch.setattr(security, "SessionLocal", factory)
    monkeypatch.setattr(worker, "SessionLocal", factory)
    monkeypatch.setattr(config, "UPLOAD_DIR", tmp_path / "quarantine")
    monkeypatch.setattr(config, "DEMO_MODE", True)
    monkeypatch.setattr(config, "IDENTITY_PROVIDER", "simulated")
    clients = []
    def client(email=None):
        instance = TestClient(app)
        clients.append(instance)
        if email:
            response = instance.post("/api/v1/auth/login", json={"email": email, "password": "DemoPass@123!"})
            assert response.status_code == 200, response.text
            instance.headers["X-CSRF-Token"] = response.json()["csrf_token"]
        return instance
    yield client, factory
    for instance in clients:
        instance.close()
    app.dependency_overrides.clear()
    engine.dispose()
