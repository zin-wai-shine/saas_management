import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
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

const ImageGallery = ({ images, setPreviewImage }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (images.length === 1) {
    const fullUrl = images[0].startsWith('http')
      ? images[0]
      : `${BASE_URL}${images[0].startsWith('/') ? '' : '/'}${images[0]}`;
    return (
      <img
        src={fullUrl}
        className="rounded-lg cursor-pointer hover:opacity-95 transition-all w-full object-cover max-h-48"
        onClick={() => setPreviewImage(fullUrl)}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
      />
    );
  }

  if (isExpanded) {
    return (
      <div className="grid grid-cols-2 gap-1 my-2 transition-all duration-500 animate-in fade-in zoom-in-95">
        {images.map((imgUrl, i) => {
          const fullUrl = imgUrl.startsWith('http')
            ? imgUrl
            : `${BASE_URL}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
          return (
            <img
              key={i}
              src={fullUrl}
              className="rounded-lg cursor-pointer hover:opacity-95 transition-all w-full h-24 md:h-32 object-cover shadow-lg hover:scale-[1.05]"
              onClick={() => setPreviewImage(fullUrl)}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
            />
          );
        })}
      </div>
    );
  }

  const visibleImages = images.slice(0, 3);
  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40 cursor-pointer group my-2 mr-2 transition-all duration-300 active:scale-95" onClick={() => setIsExpanded(true)}>
      {visibleImages.reverse().map((imgUrl, i) => {
        const displayIndex = visibleImages.length - 1 - i;
        const offset = displayIndex * 6;
        const fullUrl = imgUrl.startsWith('http')
          ? imgUrl
          : `${BASE_URL}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;

        return (
          <div
            key={i}
            className="absolute inset-0 rounded-xl border border-white/10 shadow-2xl transition-all duration-500 ease-out overflow-hidden group-hover:scale-[1.02]"
            style={{
              transform: `translate(${offset}px, -${offset}px)`,
              zIndex: displayIndex,
              backgroundColor: '#1E293B'
            }}
          >
            <img src={fullUrl} className="w-full h-full object-cover" />
            {displayIndex > 0 && <div className="absolute inset-0 bg-black/40" />}
            {displayIndex === 0 && images.length > 3 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-lg font-bold">+{images.length - 3}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ChatWidget = () => {
  const { user, isAdmin } = useAuth();
  const { wsStatus, lastMessage, onlineUsers, typingEvents, sendMessage, sendTyping } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const ADMIN_ID = 1;
  const isAdminOnline = onlineUsers.includes(ADMIN_ID);
  const isAdminTyping = typingEvents[ADMIN_ID] > Date.now() - 3000;

  const [isDragging, setIsDragging] = useState(false);

  // Handle incoming messages from SocketContext
  useEffect(() => {
    if (!lastMessage || isAdmin()) return;

    const msg = lastMessage;
    // Check if relevant to this user's chat with admin
    const isRelevant = (Number(msg.sender_id) === Number(ADMIN_ID) && Number(msg.receiver_id) === Number(user.id)) ||
      (Number(msg.sender_id) === Number(user.id) && Number(msg.receiver_id) === Number(ADMIN_ID));

    if (isRelevant) {
      setMessages((prev) => {
        if (prev.find(m => m.id === msg.id)) return prev;
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
  }, [lastMessage, isOpen, user, isAdmin]);

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

      return <ImageGallery images={images} setPreviewImage={setPreviewImage} />;
    }

    const parts = msg.message.split(urlRegex);
    return (
      <span className="break-words">
        {parts.map((part, i) =>
          urlRegex.test(part) ? (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-teal-200 underline inline-flex items-center gap-1">
              {part} <ExternalLink className="w-3 h-3" />
            </a>
          ) : part
        )}
      </span>
    );
  };

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      const uploadedUrls = [];
      for (const file of files) {
        // Only allow images
        if (!file.type.startsWith('image/')) continue;
        const response = await fileAPI.upload(file);
        uploadedUrls.push(response.data.url);
      }
      if (uploadedUrls.length === 0) return;
      const content = uploadedUrls.length === 1 ? uploadedUrls[0] : JSON.stringify(uploadedUrls);
      await sendRealMessage(content, 'image');
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    await uploadFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
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

    const sent = sendMessage(ADMIN_ID, text, type);
    if (!sent) {
      try {
        const res = await messageAPI.sendMessage({ receiver_id: ADMIN_ID, message: text, message_type: type });
        setMessages(prev => prev.map(m => m.id === tempId ? { ...res.data, isSending: false } : m));
      } catch (err) {
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, error: true, isSending: false } : m));
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 50);
      setUnreadCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && !isAdmin()) {
      fetchInitialMessages();
    }
  }, [user]);

  const fetchInitialMessages = async () => {
    try {
      setLoading(true);
      const convRes = await messageAPI.getOrCreateConversation(ADMIN_ID);
      const msgRes = await messageAPI.getMessages(convRes.data.id);
      setMessages(msgRes.data || []);
      setTimeout(scrollToBottom, 50);
    } catch (error) { } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    sendTyping(ADMIN_ID, value.length > 0);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    sendTyping(ADMIN_ID, false);
    await sendRealMessage(newMessage.trim(), 'text');
  };

  if (!user || isAdmin()) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          <div className="p-4 bg-teal-500/10 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold">A</div>
                {isAdminOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-gray-900 rounded-full"></div>}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Support Admin</h3>
                <span className={`text-[10px] uppercase font-bold ${isAdminOnline ? 'text-green-400' : 'text-gray-500'}`}>
                  {isAdminOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white"><Minimize2 className="w-5 h-5" /></button>
          </div>

          <div
            className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative transition-all duration-200 ${isDragging ? 'bg-teal-500/5' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-4 border-2 border-dashed border-teal-500/40 rounded-xl bg-teal-500/10 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center pointer-events-none animate-pulse">
                <ImageIcon className="w-10 h-10 text-teal-400 mb-2" />
                <p className="text-teal-400 text-xs font-bold uppercase tracking-widest">Drop images here</p>
              </div>
            )}

            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8"><p className="text-gray-400 text-sm italic">No messages yet.</p></div>
            ) : (
              messages.map((msg, idx) => {
                const isOwn = Number(msg.sender_id) === Number(user.id);
                return (
                  <div key={msg.id || idx} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl text-sm ${msg.message_type === 'image'
                      ? ''
                      : isOwn
                        ? 'bg-teal-500 text-white rounded-tr-none px-4 py-2'
                        : 'bg-gray-800 border border-white/5 text-white rounded-tl-none px-4 py-2'
                      }`}>{renderMessageContent(msg)}</div>
                    <span className="text-[9px] text-gray-500 mt-1 uppercase font-bold">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {isOwn && msg.is_read && ' · Seen'}
                    </span>
                  </div>
                );
              })
            )}
            {isAdminTyping && <div className="text-[9px] text-teal-400/70 font-bold uppercase animate-pulse">Admin is typing...</div>}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/5 flex gap-2 items-center">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" multiple />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-teal-400 transition-colors">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            </button>
            <div className="relative flex-1 group">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type..."
                className="w-full bg-gray-800 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-all pr-12"
              />
              <div className="absolute right-1.5 top-1 bottom-1 flex items-center">
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-300 ${!newMessage.trim()
                    ? 'text-gray-600'
                    : 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 hover:scale-110 active:scale-95'
                    }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
        {isOpen ? <X className="w-6 h-6 text-white" /> : <><MessageSquare className="w-6 h-6 text-white" />{unreadCount > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-gray-900">{unreadCount}</span>}</>}
      </button>

      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-full max-h-full object-contain" />
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};
