from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from models.message import Message

router = APIRouter()

@router.get("/history/{room_id}")
def get_chat_history(room_id: str, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(Message.room_id == room_id).order_by(Message.timestamp).all()

    return [
        {
            "from": msg.from_user,
            "to": msg.to_user,
            "message": msg.content,
            "timestamp": msg.timestamp.isoformat()
        }
        for msg in messages
    ]