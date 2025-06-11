from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from db.database import SessionLocal, get_db
from models.user import User

router = APIRouter()

@router.post("/login")
def login(username: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(username=username)
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"user_id": user.id, "username": user.username}