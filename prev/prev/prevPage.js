"use client";

import { useRef, useEffect, useState } from 'react';

export default function Home() {
    const [input, setInput] = useState(''); //入力中のメッセージ
    const [messages, setMessages] = useState([]); //受け取ったメッセージ
    const [username, setUsername] = useState('');

    //WebSocketのインスタンスを保持
    const socketRef = useRef(null);

    //wsの接続とメッセージ受信処理
    useEffect(() => {
        // ユーザー名入力
        const name = prompt('ユーザー名を入力してください');
        setUsername(name);

        //サーバーにws接続
        const socket = new WebSocket('ws://localhost:8000/ws');
        socketRef.current = socket;


        socket.onopen = () => {
            //接続後にユーザー名をサーバーに送信
            socket.send(JSON.stringify({ type: 'join', name }));
        };


        //サーバーからメッセージを受信したときの処理
        socket.onmessage = (e) => {
            // setMessages((prev) => [...prev, e.data]); //新しいメッセージ表示
            const message = JSON.parse(e.data);
            setMessages((prev) => [...prev, message]);
        };


        //コンポーネントがアンマウントされる(画面から消える)ときに接続を閉じる
        return () => {
            socket.close();
        };
    }, []);

    // メッセージ送信処理
    const sendMessage = () => {
        if (input.trim() != '' && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({type: 'message', text: input}));
        }
    };

    return (
        <div style={{padding: 20}}>
            <h2>チャット (ユーザー名: {username}) </h2>
            <div style={{ border: '1px solid gray', height: 300, overflowY: 'scroll', padding: 10}}>

                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.name}:</strong> {msg.text}
                    </div>
                ))}
            </div>

            {/* メッセージ入力フォーム */}
            <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='メッセージを入力'
                style={{width: '80%'}}
            />
            <button onClick={sendMessage}>送信</button>
        </div>
    );
}