"use client";

import { useState, useEffect } from 'react';

export default function Home() {
    const [chatPartners, setChatPartners] = useState([]);
    const [newUser, setNewUser] = useState("");

    const [username, setUsername] = useState("");
    const [loggedInUser, setLoggedInUser] = useState(null);
    
    // useEffect(() => {
    //     if (!loggedInUser) return;

    //     const ws = new WebSocket(`ws://localhost:8000/ws/notify/${loggedInUser.username}`)

    //     ws.onmessage = async () => {
    //         console.log("通知を受信しました。チャット相手一覧を更新します");
    //         const res = await fetch(`http:/localhost:8000/chat_partners/${loggedInUser.username}`)
    //         if (res.ok) {
    //             const partners = await res.json();
    //             setChatPartners(partners);
    //         }
    //     };

    //     ws.onerror = (err) => {
    //         console.error("WebSocket エラー:", err);
    //     };

    //     return () => ws.close();
    // }, [loggedInUser]);


    const handleLogin = async () => {
        const formData = new URLSearchParams();
        formData.append("username", username);

        const res = await fetch("http://localhost:8000/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
        });

        const data = await res.json();
        if (res.ok) {
            setLoggedInUser(data);

            // ユーザー一覧取得
            const partnerRes = await fetch(`http://localhost:8000/chat_partners/${data.username}`);
            if (partnerRes.ok) {
                const partners = await partnerRes.json();
                setChatPartners(partners);
            }
        } else {
            alert("ログイン失敗");
        }
    };

    return (
        <div className='p-6'>
            {!loggedInUser ? (
                <div className='mb-4'>
                    <h2 className='text-xl mb-2'>ログイン</h2>
                    <input 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className='border px-2 py-1 mr-2'
                        placeholder='ユーザー名'
                    />
                    <button onClick={handleLogin} className='bg-green-500 text-white px-4 py-1 rounded'>
                        ログイン
                    </button>
                </div>
            ) : (
                <>
                    <h1 className='text-xl mb-4'>{loggedInUser.username} さん、こんにちは</h1>

                    <h2 className='text-lg font-bold mb-2'>チャット相手一覧</h2>
                    <ul className='space-y-2'>
                        {chatPartners.map((partner) => (
                            <li key={partner}>
                                <a href={`/chat/${partner}?from=${loggedInUser.username}`} className='text-blue-600 underline'>
                                    {partner}さんとのチャットへ
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* 新しいチャット相手を入力するフォーム */}
                    <div className='mt-4'>
                        <h3 className='text-lg font-bold mb-2'>新しい相手とチャットを始める</h3>
                        <input 
                            value={newUser}
                            onChange={(e) => setNewUser(e.target.value)}
                            placeholder='ユーザー名を入力'
                            className='border px-2 py-1 mr-2'
                        />
                        <a
                            href={`/chat/${newUser}?from=${loggedInUser.username}`}
                            className='bg-blue-500 text-white px-4 py-1 rounded inline-block'
                        >
                            チャット開始
                        </a>
                    </div>
                </>
            )}
        </div>
    );
}
