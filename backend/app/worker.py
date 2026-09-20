"""Durable local sink with atomic claim/delivery; no fake external SMS/webhook."""
import logging
import signal
import time
from datetime import timedelta
from sqlalchemy import select
from .db import SessionLocal
from .models import Outbox, EventDelivery, now

log = logging.getLogger("kutumb.worker")
running = True

def process_batch(limit=50):
    delivered = 0
    with SessionLocal.begin() as db:
        rows = db.scalars(select(Outbox).where(Outbox.status.in_(["pending", "retry"]), Outbox.available_at <= now()).order_by(Outbox.created_at).limit(limit).with_for_update(skip_locked=True)).all()
        for row in rows:
            row.attempts += 1
            try:
                with db.begin_nested():
                    if not db.scalar(select(EventDelivery.id).where(EventDelivery.event_id == row.id)):
                        db.add(EventDelivery(event_id=row.id))
                    row.status = "delivered"
                    row.delivered_at = now()
                    row.last_error = None
                    db.flush()
                delivered += 1
            except Exception:
                row.status = "dead_letter" if row.attempts >= 5 else "retry"
                row.available_at = now() + timedelta(seconds=min(300, 2 ** row.attempts))
                row.last_error = "Local delivery failed; inspect protected operational diagnostics"
    return delivered

def stop(*_):
    global running
    running = False

def main():
    logging.basicConfig(level=logging.INFO)
    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    while running:
        try:
            count = process_batch()
            if count:
                log.info("Delivered %d synthetic events to local durable sink", count)
        except Exception:
            log.error("Outbox batch unavailable; retrying without discarding events")
        time.sleep(2)

if __name__ == "__main__":
    main()
