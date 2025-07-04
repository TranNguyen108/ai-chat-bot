import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GroupChat = () => {
    const [user, setUser] = useState(null);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomCode, setRoomCode] = useState('');
    const [newRoomName, setNewRoomName] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isRoomListConnected, setIsRoomListConnected] = useState(false);
    
    const ws = useRef(null);
    const roomListWs = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Get user from localStorage - use same key as main app
        const userData = localStorage.getItem('chatai_user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        
        // Connect to room list WebSocket
        connectToRoomList();
        
        return () => {
            if (ws.current) {
                ws.current.close();
            }
            if (roomListWs.current) {
                roomListWs.current.close();
            }
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const connectToRoomList = () => {
        roomListWs.current = new WebSocket('ws://127.0.0.1:8000/ws/rooms/');
        
        roomListWs.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'room_list') {
                setAvailableRooms(data.rooms);
            }
        };

        roomListWs.current.onopen = () => {
            console.log('Connected to room list WebSocket');
            setIsRoomListConnected(true);
            // Request room list when connected
            roomListWs.current.send(JSON.stringify({ action: 'get_rooms' }));
        };

        roomListWs.current.onclose = () => {
            console.log('Room list WebSocket disconnected');
            setIsRoomListConnected(false);
        };
    };

    const createRoom = async () => {
        if (!newRoomName.trim() || !user) return;

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/v2/rooms/create/', {
                title: newRoomName,
                user_id: user.id
            });

            const newRoom = response.data;
            setNewRoomName('');
            setIsCreatingRoom(false);
            joinRoom(newRoom.room_code);
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Lỗi khi tạo phòng: ' + (error.response?.data?.error || error.message));
        }
    };

    const joinRoom = (code) => {
        if (!code || !user) return;

        // Close existing connection
        if (ws.current) {
            ws.current.close();
        }

        // Clear current messages
        setMessages([]);
        setRoomCode(code);

        // Connect to room WebSocket
        ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${code}/`);

        ws.current.onopen = () => {
            console.log(`Connected to room ${code}`);
            setIsConnected(true);
            setCurrentRoom(code);
            loadRoomHistory(code);
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'chat_message') {
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    content: data.message,
                    role: data.role,
                    user: data.user,
                    timestamp: new Date()
                }]);
            } else if (data.type === 'user_joined') {
                console.log(data.message);
            } else if (data.type === 'online_users') {
                setOnlineUsers(data.users);
            }
        };

        ws.current.onclose = () => {
            console.log(`Disconnected from room ${code}`);
            setIsConnected(false);
            setCurrentRoom(null);
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    };

    const loadRoomHistory = async (roomCode) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/v2/rooms/${roomCode}/history/`);
            setMessages(response.data.messages.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            })));
        } catch (error) {
            console.error('Error loading room history:', error);
        }
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !ws.current || !user) return;

        const messageData = {
            message: newMessage,
            user_id: user.id,
            type: 'user'
        };

        ws.current.send(JSON.stringify(messageData));
        setNewMessage('');
    };

    const leaveRoom = () => {
        if (ws.current) {
            ws.current.close();
        }
        setCurrentRoom(null);
        setMessages([]);
        setRoomCode('');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Vui lòng đăng nhập</h2>
                    <p>Bạn cần đăng nhập để sử dụng tính năng group chat.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar - Room List */}
            <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
                <div className="p-4 border-b border-gray-300">
                    <h2 className="text-lg font-bold">Group Chat</h2>
                    <p className="text-sm text-gray-600">Xin chào {user.email}</p>
                </div>

                {/* Create Room Section */}
                <div className="p-4 border-b border-gray-300">
                    {!isCreatingRoom ? (
                        <button 
                            onClick={() => setIsCreatingRoom(true)}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            Tạo phòng mới
                        </button>
                    ) : (
                        <div>
                            <input
                                type="text"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                placeholder="Tên phòng..."
                                className="w-full p-2 border border-gray-300 rounded mb-2"
                                onKeyPress={(e) => e.key === 'Enter' && createRoom()}
                            />
                            <div className="flex gap-2">
                                <button 
                                    onClick={createRoom}
                                    className="flex-1 bg-green-500 text-white py-1 px-2 rounded text-sm hover:bg-green-600"
                                >
                                    Tạo
                                </button>
                                <button 
                                    onClick={() => {setIsCreatingRoom(false); setNewRoomName('');}}
                                    className="flex-1 bg-gray-500 text-white py-1 px-2 rounded text-sm hover:bg-gray-600"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Join Room by Code */}
                <div className="p-4 border-b border-gray-300">
                    <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        placeholder="Mã phòng..."
                        className="w-full p-2 border border-gray-300 rounded mb-2"
                    />
                    <button 
                        onClick={() => joinRoom(roomCode)}
                        className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                    >
                        Tham gia phòng
                    </button>
                </div>

                {/* Available Rooms */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                        <h3 className="font-semibold mb-2">Phòng có sẵn</h3>
                        {availableRooms.length === 0 ? (
                            <p className="text-gray-500 text-sm">Chưa có phòng nào</p>
                        ) : (
                            availableRooms.map((room) => (
                                <div 
                                    key={room.room_code}
                                    className={`p-2 mb-2 rounded cursor-pointer border ${
                                        currentRoom === room.room_code 
                                            ? 'bg-blue-100 border-blue-300' 
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                    onClick={() => joinRoom(room.room_code)}
                                >
                                    <div className="font-medium">{room.title}</div>
                                    <div className="text-xs text-gray-500">Mã: {room.room_code}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {currentRoom ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-300 p-4 flex justify-between items-center">
                            <h3 className="font-bold">Phòng: {currentRoom}</h3>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">
                                    Online: {onlineUsers.length}
                                </span>
                                <button 
                                    onClick={leaveRoom}
                                    className="bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
                                >
                                    Rời phòng
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                                </div>
                            ) : (
                                messages.map((message, index) => (
                                    <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            message.role === 'user' 
                                                ? 'bg-blue-500 text-white' 
                                                : message.role === 'assistant'
                                                ? 'bg-green-100 text-green-800 border border-green-300'
                                                : 'bg-white border border-gray-300'
                                        }`}>
                                            {message.user && (
                                                <div className="text-xs opacity-75 mb-1">
                                                    {message.user}
                                                </div>
                                            )}
                                            <div className="whitespace-pre-wrap">{message.content}</div>
                                            <div className="text-xs opacity-75 mt-1">
                                                {message.timestamp?.toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t border-gray-300 p-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button 
                                    onClick={sendMessage}
                                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Gửi
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-4">Chào mừng đến Group Chat!</h3>
                            <p className="text-gray-600 mb-4">Tạo phòng mới hoặc tham gia phòng có sẵn để bắt đầu trò chuyện.</p>
                            <div className="text-sm text-gray-500">
                                <p>• Tạo phòng mới và chia sẻ mã phòng với bạn bè</p>
                                <p>• Nhập mã phòng để tham gia phòng có sẵn</p>
                                <p>• AI sẽ tham gia trò chuyện và ghi nhớ lịch sử</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupChat;
