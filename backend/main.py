from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import websocket, auth, history, users
from db.database import init_db

app = FastAPI()

init_db()

# websocketのルーティングを登録
app.include_router(websocket.router)
app.include_router(auth.router)
app.include_router(history.router)
app.include_router(users.router)

# ↓httpとかは必要,websocketのみなら必要ないらしい(意外過ぎ)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



