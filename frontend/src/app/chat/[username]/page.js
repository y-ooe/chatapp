"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage({params}) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const {username: to} = use(params); // URLから取得（相手の名前）use()で非同期対応
    const from = searchParams.get('from'); //クエリから取得(自分の名前)

    const roomId = [from, to].sort().join('_');

    const [message, setMessage] = useState('');
    const [chatLog, setChatLog] = useState([]);
    const ws = useRef(null);

    // 未ログインだった場合は戻す
    useEffect(() => {
        if (!from) {
            alert("ログイン情報がありません");
            router.push('/');
        }
    }, [from]);

    // 履歴の取得
    useEffect(() => {
        if (!from) return;

        const fetchHistory = async () => {
            try {
                const res = await fetch(`http://localhost:8000/history/${roomId}`);
                const data = await res.json();
                setChatLog(data);
            } catch (err) {
                console.error("履歴取得失敗", err);
            }
        };

        fetchHistory();
    }, [roomId]);

    useEffect(() => {
        if (!from) return;

        ws.current = new WebSocket(`ws://localhost:8000/ws/${roomId}`);

        ws.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setChatLog(prev => [...prev, data]);
        };

        return () => {
            ws.current?.close();
        };
    }, [roomId]);

    const sendMessage = () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ from, to, message }));
            setMessage('');
        }
    };

    return (
        <div className='p-6'>
            <h1 className='text-xl mb-4'>{from} → {to} のチャット</h1>

            <div className='border h-48 overflow-y-scroll p-2 mb-4'>
                {chatLog.map((msg, idx) => (
                    <div key={idx} className={msg.from === from ? 'text-right' : 'text-left'}>
                        <span className='font-bold'>{msg.from}:</span>
                        {msg.message}
                    </div>
                ))}
            </div>

            <div className='flex gap-2'>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className='flex-1 border px-2 py-1'
                />
                <button 
                    onClick={sendMessage} 
                    className='bg-blue-500 text-white px-4 py-1 rounded'
                >
                    送信
                </button>
            </div>
            <a href="/">トップに戻る</a>
        </div>
        
    );
}