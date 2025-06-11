from fastapi import WebSocket
from typing import Dict, List
from db.database import SessionLocal
from models.message import Message
from datetime import datetime
from .chat_notify_manager import ChatNotifyManager

class ChatService:
    def __init__(self):
        # ルームIDごとのws接続リスト
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()

        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    async def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)

    async def broadcast(self, room_id: str, message: dict):
        # from/toが含まれている想定(個チャ用)
        sender = message.get("from")
        receiver = message.get("to")
        text = message.get("message")

        print(f"[{room_id}] {sender} -> {receiver}: {text}")

        # await ChatNotifyManager.send_notification(receiver)

        # メッセージ保存処理
        db = SessionLocal()
        try:
            msg = Message(
                room_id=room_id,
                from_user=sender,
                to_user=receiver,
                content=text,
            )
            db.add(msg)
            db.commit()
        finally:
            db.close()

        # とりあえず全員に送る
        for connection in self.active_connections.get(room_id, []):
            await connection.send_json({
                "from": sender,
                "to": receiver,
                "message": text
            })