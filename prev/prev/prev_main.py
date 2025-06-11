from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 接続中のクライアント(websocket)とユーザー名を保持
connected_clients = {}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # data = await websocket.receive_text() # メッセージ受信
            # await websocket.send_text(f"Echo: {data}")

            data = await websocket.receive_json()

            print(data)

            # ユーザー参加メッセージ
            if data["type"] == "join":
                connected_clients[websocket] = data["name"]
                await broadcast({"name": "System", "text": f"{data['name']}さんが参加しました"})

            # チャットメッセージ
            elif data["type"] == "message":
                name = connected_clients.get(websocket, "名無し")
                await broadcast({"name": name, "text": data["text"]})

    
    except WebSocketDisconnect:
        name = connected_clients.get(websocket, "誰か")
        del connected_clients[websocket]
        await broadcast({"name": "System", "text": f"{name} さんが退出しました"})


# 全員に送信する関数
async def broadcast(message: dict):
    # ↑ WebSocket型が辞書に入っている->wsの関数が使える

    for client in connected_clients:
        await client.send_json(message)