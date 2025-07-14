# WebSocketを使用した簡易チャットアプリ

##  目次

- [概要](#概要)
- [使用技術](#使用技術)
- [セットアップ](#セットアップ)

---

##  概要

websocketのチュートリアルとして作ったシンプルなチャットアプリです。  
バックエンドは FastAPI、フロントエンドは Next.js を使用しています。

WebSocketに初めて挑戦したのでaiに頼ってるところが多いです...

---

##  使用技術

- **フロントエンド**: Next.js (React), Tailwind CSS
- **バックエンド**: FastAPI, WebSocket
- **データベース**: SQLite → PostgreSQL（移行対応中）
- **その他**: Python 3.12, SQLAlchemy

---

##  セットアップ

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

### バックエンド
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

