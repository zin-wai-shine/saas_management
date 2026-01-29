import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Modal } from '../../components/Modal';
import { Dropdown } from '../../components/Dropdown';
import { Toast, ToastContainer } from '../../components/Toast';
import { messageAPI, userAPI, fileAPI, BASE_URL } from '../../api/api';
import {
  Search,
  Send,
  MessageSquare,
  UserPlus,
  X,
  ChevronLeft,
  Clock,
  Image as ImageIcon,
  Paperclip,
  ExternalLink,
  Loader2,
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
        alt="Shared 0"
        className="rounded-lg cursor-pointer hover:opacity-95 transition-all border border-white/5 object-cover w-full max-h-64"
        onClick={() => setPreviewImage(fullUrl)}
        onError={(e) => {
          if (e.target.src !== 'https://via.placeholder.com/150?text=Image+Not+Found') {
            e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
          }
        }}
      />
    );
  }

  if (isExpanded) {
    return (
      <div className="grid grid-cols-2 gap-2 my-3 transition-all duration-500 animate-in fade-in zoom-in-95">
        {images.map((imgUrl, i) => {
          const fullUrl = imgUrl.startsWith('http')
            ? imgUrl
            : `${BASE_URL}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
          return (
            <img
              key={i}
              src={fullUrl}
              alt={`Shared ${i}`}
              className="rounded-xl cursor-pointer hover:opacity-95 transition-all w-full h-32 md:h-40 object-cover border border-white/5 hover:scale-[1.05]"
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

  const visibleImages = images.slice(0, 3);
  return (
    <div className="relative w-40 h-40 md:w-48 md:h-48 cursor-pointer group my-3 mr-3 transition-all duration-300 active:scale-95" onClick={() => setIsExpanded(true)}>
      {visibleImages.reverse().map((imgUrl, i) => {
        const displayIndex = visibleImages.length - 1 - i;
        const offset = displayIndex * 8;
        const fullUrl = imgUrl.startsWith('http')
          ? imgUrl
          : `${BASE_URL}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;

        return (
          <div
            key={i}
            className="absolute inset-0 rounded-2xl border border-white/10 transition-all duration-500 ease-out overflow-hidden group-hover:scale-[1.02]"
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
                <span className="text-white text-xl font-black">+{images.length - 3}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const MessagesPage = () => {
  const { user } = useAuth();
  const { wsStatus, lastMessage, typingEvents, sendMessage, sendTyping } = useSocket();
  const userRef = useRef(user);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const selectedConversationRef = useRef(null);

  // Update refs whenever state changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // WebSocket message handling
  useEffect(() => {
    if (!lastMessage) return;

    const msg = lastMessage;
    const currentSelected = selectedConversationRef.current;
    const currentUser = userRef.current;
    const currentUserId = Number(currentUser?.id || 1);

    const otherIdInMsg = Number(msg.sender_id) === currentUserId
      ? Number(msg.receiver_id)
      : Number(msg.sender_id);

    const otherIdInChat = currentSelected ? Number(getOtherUserId(currentSelected)) : null;

    const isActiveChat = currentSelected && (
      Number(msg.conversation_id) === Number(currentSelected.id) ||
      otherIdInMsg === otherIdInChat
    );

    if (isActiveChat) {
      setMessages((prev) => {
        if (prev.find(m => m.id === msg.id)) return prev;
        const filtered = prev.filter(m => !(m.isSending && m.message === msg.message));
        return [...filtered, msg];
      });

      if (Number(msg.receiver_id) === currentUserId) {
        messageAPI.getMessages(currentSelected.id).catch(() => { });
      }

      setTimeout(scrollToBottom, 50);
    }

    setConversations((prev) => {
      const idx = prev.findIndex(c =>
        Number(c.id) === Number(msg.conversation_id) ||
        Number(getOtherUserId(c)) === otherIdInMsg
      );

      if (idx === -1) {
        fetchConversations();
        return prev;
      }

      const updatedList = [...prev];
      const conv = { ...updatedList[idx] };
      conv.last_message = msg.message;
      conv.last_message_at = msg.created_at;

      if (isActiveChat) {
        conv.unread_count = 0;
      } else if (Number(msg.receiver_id) === currentUserId) {
        conv.unread_count = (Number(conv.unread_count) || 0) + 1;
      }

      updatedList.splice(idx, 1);
      return [conv, ...updatedList];
    });
  }, [lastMessage]);

  // URL Detection Regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const renderMessageContent = (message) => {
    if (message.message_type === 'image') {
      let images = [];
      try {
        if (message.message.startsWith('[')) {
          images = JSON.parse(message.message);
        } else {
          images = [message.message];
        }
      } catch (e) {
        images = [message.message];
      }

      return <ImageGallery images={images} setPreviewImage={setPreviewImage} />;
    }

    const parts = message.message.split(urlRegex);
    return (
      <p className="text-[13px] md:text-sm leading-relaxed font-medium break-words">
        {parts.map((part, i) =>
          urlRegex.test(part) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-300 hover:text-teal-200 underline inline-flex items-center gap-1"
            >
              {part} <ExternalLink className="w-3 h-3" />
            </a>
          ) : part
        )}
      </p>
    );
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !selectedConversation) return;

    if (files.length > 5) {
      alert('You can only upload up to 5 images at a time.');
      return;
    }

    const invalidFiles = files.filter(f => !f.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      alert('Please select only image files.');
      return;
    }

    try {
      setUploading(true);
      const uploadedUrls = [];
      for (const file of files) {
        const response = await fileAPI.upload(file);
        uploadedUrls.push(response.data.url);
      }

      const messageContent = uploadedUrls.length === 1
        ? uploadedUrls[0]
        : JSON.stringify(uploadedUrls);

      await sendRealMessage(messageContent, 'image');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload some images. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendRealMessage = async (text, type = 'text') => {
    const receiverId = getOtherUserId(selectedConversation);
    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      conversation_id: selectedConversation.id,
      sender_id: user?.id || 1,
      receiver_id: receiverId,
      message: text,
      message_type: type,
      is_read: false,
      created_at: new Date().toISOString(),
      isSending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    setTimeout(scrollToBottom, 100);

    const sent = sendMessage(receiverId, text, type);
    if (!sent) {
      try {
        const response = await messageAPI.sendMessage({
          receiver_id: receiverId,
          message: text,
          message_type: type,
        });
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...response.data, isSending: false } : msg)));
      } catch (apiError) {
        setTimeout(() => {
          setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, isSending: false } : msg)));
        }, 1000);
      }
    }
    fetchConversations();
  };

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  };

  const fetchConversations = async () => {
    try {
      if (conversations.length === 0) setLoading(true);
      const response = await messageAPI.listConversations();
      const data = response.data?.data || response.data || [];
      if (data.length > 0) {
        setConversations(data);
      } else {
        if (conversations.length === 0) setConversations([]);
      }
    } catch (error) {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await messageAPI.getMessages(conversationId);
      const data = response.data?.data || response.data || [];
      setMessages(data);
      setTimeout(scrollToBottom, 50);
    } catch (error) { }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setConversations(prev => prev.map(c =>
      c.id === conversation.id ? { ...c, unread_count: 0 } : c
    ));
    fetchMessages(conversation.id);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    if (selectedConversation) {
      sendTyping(getOtherUserId(selectedConversation), value.length > 0);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !selectedConversation) return;

    sendTyping(getOtherUserId(selectedConversation), false);
    await sendRealMessage(text, 'text');
  };

  const handleNewConversation = async () => {
    if (!selectedUserId) return;
    try {
      const response = await messageAPI.getOrCreateConversation(parseInt(selectedUserId));
      const conversation = response.data;
      setSelectedConversation(conversation);
      setIsNewConversationModalOpen(false);
      setUserSearchQuery('');
      setUserSearchResults([]);
      setSelectedUserId('');
      fetchConversations();
      fetchMessages(conversation.id);
    } catch (error) { }
  };

  const handleUserSearch = async (query) => {
    setUserSearchQuery(query);
    if (query.length < 2) {
      setUserSearchResults([]);
      return;
    }
    setIsSearchingUsers(true);
    try {
      const response = await userAPI.search(query);
      setUserSearchResults(response.data || []);
    } catch (error) { } finally {
      setIsSearchingUsers(false);
    }
  };

  const getOtherUserName = (conversation) => {
    if (conversation.user1_id === user?.id || conversation.user1_id === 1) {
      return conversation.user2_name || 'User';
    }
    return conversation.user1_name || 'User';
  };

  const getOtherUserId = (conversation) => {
    if (conversation.user1_id === user?.id || conversation.user1_id === 1) {
      return conversation.user2_id;
    }
    return conversation.user1_id;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherName = getOtherUserName(conv).toLowerCase();
    return otherName.includes(searchFilter.toLowerCase());
  });

  return (
    <div className="p-3 md:p-6 h-[calc(100vh-64px)] md:h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      <div className="flex gap-4 md:gap-6 flex-1 min-h-0 relative">
        {/* Conversations Sidebar */}
        <div className={`${isMobileView && selectedConversation ? 'hidden' : 'flex'
          } w-full lg:w-[380px] flex-col bg-gray-800/40 backdrop-blur-xl border border-white/5 rounded overflow-hidden shadow-2xl`}>
          <div className="p-4 md:p-5 border-b border-white/5 bg-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Chats</h2>
              <button
                onClick={() => setIsNewConversationModalOpen(true)}
                className="p-2 bg-teal-glass/20 hover:bg-teal-glass/30 border border-teal-glass/30 rounded-lg text-white transition-all"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {loading ? (
              <div className="p-8 text-center text-gray-500 animate-pulse text-sm">Loading chats...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 italic text-sm">No conversations found</div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherName = getOtherUserName(conversation);
                const isSelected = selectedConversation?.id === conversation.id;
                const lastMsg = conversation.last_message || 'No messages yet';
                const truncated = lastMsg.length > (isMobileView ? 30 : 40) ? lastMsg.substring(0, 40) + '...' : lastMsg;

                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`group p-3 md:p-4 rounded cursor-pointer transition-all duration-300 ${isSelected
                      ? 'bg-teal-500/15 border border-teal-500/20'
                      : 'hover:bg-white/5 border border-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shadow-inner ${isSelected ? 'bg-teal-500 text-white' : 'bg-gray-700/50 text-teal-300'
                        }`}>
                        {otherName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className={`text-[13px] font-bold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {otherName}
                          </h3>
                          <span className="text-[9px] text-gray-500">
                            {conversation.last_message_at ? formatTime(conversation.last_message_at) : formatTime(conversation.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-[11px] truncate ${isSelected ? 'text-teal-100/70' : 'text-gray-400'}`}>
                            {truncated}
                          </p>
                          {conversation.unread_count > 0 && (
                            <span className={`flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-[10px] font-black border backdrop-blur-md transition-all duration-300 ${isSelected
                                ? 'bg-white/20 border-white/30 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                                : 'bg-teal-500/15 border-teal-500/20 text-teal-400'
                              }`}>
                              {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${isMobileView && !selectedConversation ? 'hidden' : 'flex'
          } flex-1 flex flex-col bg-gray-800/40 backdrop-blur-xl border border-white/5 rounded overflow-hidden shadow-2xl relative`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-white/5 flex items-center justify-between z-10">
                <div className="flex items-center gap-3 md:gap-4">
                  {isMobileView && (
                    <button onClick={() => setSelectedConversation(null)} className="p-1 text-gray-400">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-black">
                    {getOtherUserName(selectedConversation).charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-[13px] md:text-base font-bold text-white">
                    {getOtherUserName(selectedConversation)}
                  </h3>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar" ref={messagesContainerRef}>
                {messages.map((msg, idx) => {
                  const isOwn = Number(msg.sender_id) === Number(user?.id);
                  return (
                    <div key={msg.id || idx} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl transition-all duration-300 ${msg.message_type === 'image'
                        ? ''
                        : isOwn
                          ? 'bg-gradient-to-br from-teal-500/80 to-teal-600/80 text-white rounded-tr-none px-4 py-2.5 shadow-xl'
                          : 'bg-gray-700/50 border border-white/5 text-white rounded-tl-none px-4 py-2.5 shadow-xl'
                        }`}>
                        {renderMessageContent(msg)}
                      </div>
                      <span className="text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isOwn && msg.is_read && ' · Seen'}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing indicator */}
              {typingEvents[getOtherUserId(selectedConversation)] > Date.now() - 3000 && (
                <div className="px-6 py-2 text-[10px] text-teal-400/70 font-bold uppercase tracking-widest animate-pulse">
                  {getOtherUserName(selectedConversation)} is typing...
                </div>
              )}

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 md:p-6 border-t border-white/5 bg-white/5">
                <div className="flex gap-2">
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
                    className="p-2 md:p-3 bg-gray-700/50 border border-white/5 rounded-xl text-gray-400 hover:text-teal-400 hover:bg-gray-700 transition-all"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700/50 border border-white/5 rounded-xl pl-4 pr-12 py-2.5 md:py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-all disabled:opacity-20 flex items-center justify-center shadow-lg shadow-teal-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-teal-500/10 rounded-full flex items-center justify-center mb-6 border border-teal-500/20 shadow-2xl">
                <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-teal-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mb-2">Select a Conversation</h3>
              <p className="text-sm md:text-base text-gray-500 max-w-xs font-medium">Click on a chat to start messaging in real-time with your users.</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        title="Start New Conversation"
      >
        <div className="space-y-4 p-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => handleUserSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-teal-500"
            />
          </div>
          {isSearchingUsers ? (
            <div className="text-center py-4 text-gray-500">Searching...</div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {userSearchResults.map((u) => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${selectedUserId === u.id ? 'bg-teal-500/20 border border-teal-500/30' : 'hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-teal-300 font-bold">
                    {u.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{u.name}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsNewConversationModalOpen(false)}
              className="px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleNewConversation}
              disabled={!selectedUserId}
              className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium disabled:opacity-20 flex items-center justify-center shadow-lg shadow-teal-500/20"
            >
              <Send className="w-4 h-4" />
              Start Chat
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};
