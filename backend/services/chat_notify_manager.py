from fastapi import WebSocket

class ChatNotifyManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, username: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[username] = websocket

    def disconnect(self, username: str):
        self.active_connections.pop(username, None)

    async def send_notification(self, username: str):
        ws = self.active_connections.get(username)
        if ws:
            await ws.send_text("update")