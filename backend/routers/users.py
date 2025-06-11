from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.user import User
from models.message import Message
from typing import List

router = APIRouter()

@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/chat_partners/{username}", response_model=List[str])
def get_chat_partners(username: str, db: Session = Depends(get_db)):

    sent = db.query(Message.to_user).filter(Message.from_user == username)
    received = db.query(Message.from_user).filter(Message.to_user == username)

    partners = set([r[0] for r in sent.union(received).all() if r[0] != username])

    return list(partners)