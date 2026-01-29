import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [wsStatus, setWsStatus] = useState('disconnected'); // connecting, connected, disconnected
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [lastMessage, setLastMessage] = useState(null);
    const [typingEvents, setTypingEvents] = useState({}); // {senderId: timestamp}
    const wsRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const reconnectTimeoutRef = useRef(null);

    const connectWebSocket = () => {
        if (!user) return;

        if (wsRef.current) {
            wsRef.current.close();
        }

        const token = localStorage.getItem('token');
        const host = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
        const wsUrl = `ws://${host}:8080/api/ws?token=${token}`;

        setWsStatus('connecting');
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setWsStatus('connected');
            reconnectAttempts.current = 0;
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };

        ws.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                const { type, data, users } = payload;

                switch (type) {
                    case 'online_users':
                        setOnlineUsers(users || []);
                        break;
                    case 'typing':
                        setTypingEvents(prev => ({
                            ...prev,
                            [data.sender_id]: data.is_typing ? Date.now() : 0
                        }));
                        break;
                    case 'message':
                        setLastMessage(data);
                        break;
                    default:
                        break;
                }
            } catch (err) {
                console.error('Socket Message Error:', err);
            }
        };

        ws.onclose = () => {
            setWsStatus('disconnected');
            attemptReconnect();
        };

        ws.onerror = () => {
            setWsStatus('disconnected');
            ws.close();
        };
    };

    const attemptReconnect = () => {
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        const backoff = Math.min(12000, 3000 * Math.pow(2, reconnectAttempts.current));
        reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connectWebSocket();
        }, backoff);
    };

    useEffect(() => {
        if (user) {
            connectWebSocket();
        } else {
            wsRef.current?.close();
            setWsStatus('disconnected');
        }
        return () => {
            wsRef.current?.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [user]);

    const sendMessage = (receiverId, message, type = 'text') => {
        if (wsRef.current && wsStatus === 'connected') {
            wsRef.current.send(JSON.stringify({
                receiver_id: receiverId,
                message,
                message_type: type
            }));
            return true;
        }
        return false;
    };

    const sendTyping = (receiverId, isTyping) => {
        if (wsRef.current && wsStatus === 'connected') {
            wsRef.current.send(JSON.stringify({
                type: 'typing',
                receiver_id: receiverId,
                is_typing: isTyping
            }));
            return true;
        }
        return false;
    };

    const value = {
        wsStatus,
        onlineUsers,
        lastMessage,
        typingEvents,
        sendMessage,
        sendTyping,
        wsRef
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
