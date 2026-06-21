from __future__ import annotations

import argparse

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.entities import User


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or promote an admin user.")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--full-name", dest="full_name", default="Administrator")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        email = args.email.lower().strip()
        user = db.scalar(select(User).where(User.email == email))
        if user:
            user.role = "admin"
            user.is_active = True
            user.password_hash = hash_password(args.password)
            if not user.full_name:
                user.full_name = args.full_name
            action = "Promoted existing user to admin"
        else:
            user = User(
                email=email,
                password_hash=hash_password(args.password),
                full_name=args.full_name,
                role="admin",
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            action = "Created admin user"
        db.commit()
        print(f"{action}: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
