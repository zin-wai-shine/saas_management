import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../api/api';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Minimize2,
} from 'lucide-react';

export const ChatWidget = () => {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef(null);

  const ADMIN_ID = 1;

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the DOM is rendered before scrolling
      setTimeout(scrollToBottom, 50);
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

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
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data, users } = payload;

        switch (type) {
          case 'history':
            const adminHistory = data.filter(m => 
              (m.sender_id === ADMIN_ID && m.receiver_id === user.id) ||
              (m.sender_id === user.id && m.receiver_id === ADMIN_ID)
            );
            setMessages(adminHistory.reverse());
            break;

          case 'online_users':
            setIsAdminOnline(users?.includes(ADMIN_ID) || false);
            break;

          case 'message':
            const msg = data;
            // Use Number() for robust ID comparison
            const isRelevant = (Number(msg.sender_id) === Number(ADMIN_ID) && Number(msg.receiver_id) === Number(user.id)) ||
                               (Number(msg.sender_id) === Number(user.id) && Number(msg.receiver_id) === Number(ADMIN_ID));
            
            if (isRelevant) {
              setMessages((prev) => {
                const exists = prev.find(m => m.id === msg.id);
                if (exists) return prev;
                const filtered = prev.filter(m => !(m.isSending && m.message === msg.message));
                return [...filtered, msg];
              });

              if (!isOpen && Number(msg.sender_id) === Number(ADMIN_ID)) {
                setUnreadCount(prev => prev + 1);
              }
              
              if (isOpen) {
                setTimeout(scrollToBottom, 50);
              }
            }
            break;
        }
      } catch (err) {
        console.error('WS Error:', err);
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
    if (user && !isAdmin()) {
      connectWebSocket();
      fetchInitialMessages();
    }
    return () => {
      wsRef.current?.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [user]);

  const fetchInitialMessages = async () => {
    try {
      setLoading(true);
      const convRes = await messageAPI.getOrCreateConversation(ADMIN_ID);
      const msgRes = await messageAPI.getMessages(convRes.data.id);
      setMessages(msgRes.data || []);
      setTimeout(scrollToBottom, 50);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage.trim();
    const tempId = Date.now();
    
    const optimisticMessage = {
      id: tempId,
      sender_id: user.id,
      receiver_id: ADMIN_ID,
      message: text,
      created_at: new Date().toISOString(),
      isSending: true,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    if (wsStatus === 'connected' && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        receiver_id: ADMIN_ID,
        message: text
      }));
    } else {
      try {
        const response = await messageAPI.sendMessage({
          receiver_id: ADMIN_ID,
          message: text
        });
        setMessages(prev => prev.map(m => m.id === tempId ? { ...response.data, isSending: false } : m));
      } catch (err) {
        console.error('Failed to send message:', err);
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, error: true } : m));
      }
    }
  };

  if (!user || isAdmin()) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-teal-500/10 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold">
                  A
                </div>
                {isAdminOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Support Admin</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${isAdminOnline ? 'text-green-400' : 'text-gray-500'}`}>
                    {isAdminOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center space-y-2 py-8">
                <p className="text-gray-400 text-sm italic">No messages yet.</p>
                <p className="text-gray-500 text-xs px-8">How can we help you today? Send us a message and we'll get back to you shortly.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isOwn = msg.sender_id === user.id;
                const statusText = msg.isSending 
                  ? 'Sending...' 
                  : msg.error 
                    ? 'Failed' 
                    : msg.is_read 
                      ? 'Seen' 
                      : 'Delivered';

                return (
                  <div key={msg.id || idx} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} animate-fadeIn`}>
                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-lg text-sm ${
                      isOwn 
                        ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-tr-none' 
                        : 'bg-gray-800/90 border border-white/5 text-white rounded-tl-none'
                    }`}>
                      {msg.message}
                    </div>
                    <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isOwn && (
                        <div className="flex items-center gap-1">
                          <div className={`w-1 h-1 rounded-full ${msg.is_read ? 'bg-teal-400' : msg.error ? 'bg-red-400' : 'bg-gray-600'}`}></div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            msg.error ? 'text-red-400' : 'text-gray-500'
                          }`}>
                            {statusText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/5">
            <div className="relative group">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-gray-800/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-all disabled:opacity-30 disabled:grayscale"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bubble Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20 hover:scale-110 active:scale-95 transition-all"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-gray-900 animate-bounce">
                {unreadCount}
              </span>
            )}
          </>
        )}
        <div className="absolute inset-0 rounded-full bg-teal-500/20 blur-xl group-hover:bg-teal-500/40 transition-all -z-10"></div>
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
