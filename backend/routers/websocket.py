from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.chat import ChatService
from services.chat_notify_manager import ChatNotifyManager


router = APIRouter()
chat_service = ChatService()
chat_notify_manager = ChatNotifyManager()

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await chat_service.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await chat_service.broadcast(room_id, data)
    except WebSocketDisconnect:
        await chat_service.disconnect(room_id, websocket)

@router.websocket("/ws/notify/{username}")
async def websocket_notify(websocket: WebSocket, username: str):
    await chat_notify_manager.connect(username, websocket)
    try:
        while True:
            await websocket.receive_text() #pingとかが来る想定
    except WebSocketDisconnect:
        chat_notify_manager.disconnect(username)