import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageAPI, fileAPI, BASE_URL } from '../api/api';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Minimize2,
  Image as ImageIcon,
  ExternalLink,
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
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // URL Detection Regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const renderMessageContent = (msg) => {
    if (msg.message_type === 'image') {
      let images = [];
      try {
        if (msg.message.startsWith('[')) {
          images = JSON.parse(msg.message);
        } else {
          images = [msg.message];
        }
      } catch (e) {
        images = [msg.message];
      }

      return (
        <div className={`grid gap-1 ${images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {images.map((imgUrl, i) => {
            const fullUrl = imgUrl.startsWith('http') 
              ? imgUrl 
              : `${BASE_URL}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
            
            return (
              <img 
                key={i}
                src={fullUrl} 
                alt={`Shared ${i}`} 
                className={`rounded-lg cursor-pointer hover:opacity-95 transition-all shadow-xl border border-white/5 object-cover w-full ${
                  images.length === 1 ? 'max-h-48' : 'h-24 md:h-32'
                }`}
                onClick={() => setPreviewImage(fullUrl)}
                onError={(e) => {
                  if (e.target.src !== 'https://via.placeholder.com/150?text=Image+Not+Found') {
                    e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                  }
                }}
              />
            );
          })}
        </div>
      );
    }

    const parts = msg.message.split(urlRegex);
    return (
      <span className="break-words">
        {parts.map((part, i) => 
          urlRegex.test(part) ? (
            <a 
              key={i} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-teal-200 hover:text-white underline inline-flex items-center gap-1"
            >
              {part} <ExternalLink className="w-3 h-3" />
            </a>
          ) : part
        )}
      </span>
    );
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 5) {
      alert('You can only upload up to 5 images.');
      return;
    }

    try {
      setUploading(true);
      const uploadedUrls = [];
      for (const file of files) {
        const response = await fileAPI.upload(file);
        uploadedUrls.push(response.data.url);
      }
      const messageContent = uploadedUrls.length === 1 ? uploadedUrls[0] : JSON.stringify(uploadedUrls);
      await sendRealMessage(messageContent, 'image');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload some images.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendRealMessage = async (text, type = 'text') => {
    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      sender_id: user.id,
      receiver_id: ADMIN_ID,
      message: text,
      message_type: type,
      created_at: new Date().toISOString(),
      isSending: true,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setTimeout(scrollToBottom, 50);

    if (wsStatus === 'connected' && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        receiver_id: ADMIN_ID,
        message: text,
        message_type: type
      }));
    } else {
      try {
        const response = await messageAPI.sendMessage({
          receiver_id: ADMIN_ID,
          message: text,
          message_type: type
        });
        setMessages(prev => prev.map(m => m.id === tempId ? { ...response.data, isSending: false } : m));
      } catch (err) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, error: true, isSending: false } : m));
      }
    }
  };

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

  // Scroll to bottom when admin typing indicator appears
  useEffect(() => {
    if (isOpen && isAdminTyping) {
      setTimeout(scrollToBottom, 50);
    }
  }, [isAdminTyping, isOpen]);

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

          case 'typing':
            if (Number(data.receiver_id) === Number(user?.id) && Number(data.sender_id) === ADMIN_ID) {
              if (data.is_typing) {
                setIsAdminTyping(true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setIsAdminTyping(false), 3000);
              } else {
                setIsAdminTyping(false);
              }
            }
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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (wsStatus === 'connected' && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        receiver_id: ADMIN_ID,
        is_typing: value.length > 0
      }));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage.trim();

    // Stop typing immediately when sending
    if (wsStatus === 'connected' && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        receiver_id: ADMIN_ID,
        is_typing: false
      }));
    }

    await sendRealMessage(text, 'text');
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
                    <div className={`max-w-[85%] transition-all duration-300 ${
                      msg.message_type === 'image'
                        ? 'hover:scale-[1.02]'
                        : isOwn 
                          ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-tr-none px-4 py-2.5 rounded-2xl shadow-lg text-sm' 
                          : 'bg-gray-800/90 border border-white/5 text-white rounded-tl-none px-4 py-2.5 rounded-2xl shadow-lg text-sm'
                    }`}>
                      {renderMessageContent(msg)}
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

            {/* Admin Typing Bubble */}
            {isAdminTyping && (
              <div className="flex flex-col items-start animate-fadeIn">
                <div className="bg-gray-800/90 border border-white/5 text-white rounded-2xl rounded-tl-none px-4 py-2.5 shadow-lg">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"></div>
                  </div>
                </div>
                <span className="text-[9px] mt-1 font-bold uppercase tracking-widest text-gray-500 italic px-1">
                  Admin is typing...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/5 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2 text-gray-400 hover:text-teal-400 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            </button>
            <div className="relative flex-1 group">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="w-full bg-gray-800/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || uploading}
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

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[101]"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-w-full max-h-full rounded shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

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
