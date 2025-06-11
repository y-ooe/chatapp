"use client";

import { useRef, useEffect, useState } from 'react';

export default function Home() {
    const [username, setUsername] = useState("");
    const [loggedInUser, setLoggedInUser] = useState(null); //ログイン状態を保持

    const [addedUser, setAddedUser] = useState("");

    const [from, setFrom] = useState('alice');  // 自分の名前
    const [to, setTo] = useState('bob');        // 相手の名前
    const [message, setMessage] = useState(""); 
    const [chatLog, setChatLog] = useState([]);
    const ws = useRef(null);

    // // ルームIDはfromとtoをアルファベット順に並べたもの(alice_bob)
    const roomId = [from, to].sort().join('_');

    // ログイン後に履歴取得
    useEffect(() => {
        const fetchHistory = async () => {
            if (!loggedInUser) return;

            // const roomId = [from, to].sort().join('_');

            try {
                const res = await fetch(`http://localhost:8000/history/${roomId}`);
                if (res.ok) {
                    const data = await res.json();
                    setChatLog(data); //履歴をchatlogに反映
                } else {
                    console.log("履歴っ不徳失敗");
                }
            } catch (error) {
                console.error("通信エラー", error);
            }
        };

        fetchHistory();
    }, [loggedInUser, from, to])

    //wsの接続とメッセージ受信処理
    useEffect(() => {
        if (!loggedInUser) return;

        //サーバーにws接続
        ws.current = new WebSocket(`ws://localhost:8000/ws/${roomId}`);

        //サーバーからメッセージを受信したときの処理
        ws.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setChatLog((prev) => [...prev, data]);
        };

        ws.current.onclose = () => {
            console.log('WebSocket closed');
        };

        //コンポーネントがアンマウントされる(画面から消える)ときに接続を閉じる
        return () => {
            ws.current?.close();
        };
    }, [roomId, loggedInUser]); // from/toが変わったら再接続

    // メッセージ送信処理
    const sendMessage = () => {
        if (ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                from,
                to,
                message
            }));
            setMessage('');
        }
    };

    const addUser = async ({user}) => {
        const res = await fetch(`http://localhost:8000/adduser/${user}`)
        if (res.ok) {
            message.add({user})
        }
    }

    // ログイン処理
    const handleLogin = async () => {
        const formData = new URLSearchParams();
        formData.append("username", username);

        const res = await fetch("http://localhost:8000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
        });

        const data = await res.json();
        if (res.ok) {
            setLoggedInUser(data);
            setFrom(data.username); //自動的にformにもセット
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

                    <div className='mb-4'>
                        <input 
                            value={username}></input>
                    </div>

                    <h1 className='text-xl mb-4'>個別チャット({from}→{to})</h1>

                    <div className='mb-4'>
                        <label>あなたの名前: </label>
                        <input 
                            value={from} 
                            onChange={(e) => setFrom(e.target.value)} 
                            className='border px-2 py-1 mr-4'
                        />
                        <label>相手の名前: </label>
                        <input 
                            value={to} 
                            onChange={(e) => setTo(e.target.value)} 
                            className='border px-2 py-1'
                        />
                    </div>

                    <div className='border h-48 overflow-y-scroll p-2 mb-4'>
                        {chatLog.map((msg, idx) => (
                            <div key={idx} className={msg.from === from ? "text-right" : "text-left"}>
                                <span className='font-bold'>{msg.from}:</span> {msg.message}
                            </div>
                        ))}
                    </div>

                    <div className='flex gap-2'>
                        <input 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className='flex-1 border px-2 py-1'
                            placeholder='メッセージを入力'
                        />
                        <button onClick={sendMessage} className='bg-blue-500 text-white px-4 py-1 rounded'>
                            送信
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}