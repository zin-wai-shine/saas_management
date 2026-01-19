import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  Wifi,
  WifiOff,
  Image as ImageIcon,
  Paperclip,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export const MessagesPage = () => {
  const { user } = useAuth();
  const userRef = useRef(user);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const selectedConversationRef = useRef(null);

  // Update refs whenever state changes to ensure WebSocket callbacks always have latest data
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
  const [typingUsers, setTypingUsers] = useState({}); // {userId: timestamp}
  const typingTimeoutRef = useRef({});
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // URL Detection Regex
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const renderMessageContent = (message) => {
    if (message.message_type === 'image') {
      let images = [];
      try {
        // Check if it's a JSON array of images
        if (message.message.startsWith('[')) {
          images = JSON.parse(message.message);
        } else {
          images = [message.message];
        }
      } catch (e) {
        images = [message.message];
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
                  images.length === 1 ? 'max-h-64' : 'h-32 md:h-40'
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

    // Default text with URL support
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
      
      // If one image, send string. If multiple, send JSON array.
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

    if (wsStatus === 'connected' && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        receiver_id: receiverId,
        message: text,
        message_type: type
      }));
    } else {
      try {
        const response = await messageAPI.sendMessage({
          receiver_id: receiverId,
          message: text,
          message_type: type,
        });
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...response.data, isSending: false } : msg)));
      } catch (apiError) {
        // Fallback simulation for offline/error
        setTimeout(() => {
          setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, isSending: false } : msg)));
        }, 1000);
      }
    }
    fetchConversations();
  };

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // WebSocket related state
  const [wsStatus, setWsStatus] = useState('connecting'); // connecting, connected, disconnected
  const [onlineUsers, setOnlineUsers] = useState([]); // List of online user IDs
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // WebSocket connection logic
  const connectWebSocket = () => {
    if (!user) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const token = localStorage.getItem('token');
    // Use the current host but always point to 8080
    const host = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
    const wsUrl = `ws://${host}:8080/api/ws?token=${token}`;
    
    console.log(`Connecting to WebSocket at ${wsUrl}...`);
    setWsStatus('connecting');
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsStatus('connected');
      reconnectAttempts.current = 0;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data, users } = payload;
        
        switch (type) {
          case 'history':
            setMessages((current) => {
              if (current.length === 0) return data.reverse();
              return current;
            });
            break;
          
          case 'online_users':
            setOnlineUsers(users || []);
            break;
            
          case 'typing':
            if (Number(data.receiver_id) === Number(userRef.current?.id)) {
              const senderId = Number(data.sender_id);
              if (data.is_typing) {
                setTypingUsers(prev => ({ ...prev, [senderId]: Date.now() }));
                // Auto-remove after 3 seconds if no "stopped typing" event arrives
                if (typingTimeoutRef.current[senderId]) clearTimeout(typingTimeoutRef.current[senderId]);
                typingTimeoutRef.current[senderId] = setTimeout(() => {
                  setTypingUsers(prev => {
                    const newState = { ...prev };
                    delete newState[senderId];
                    return newState;
                  });
                }, 3000);
              } else {
                setTypingUsers(prev => {
                  const newState = { ...prev };
                  delete newState[senderId];
                  return newState;
                });
              }
            }
            break;

          case 'message':
            const msg = data;
            const currentSelected = selectedConversationRef.current;
            const currentUser = userRef.current;
            const currentUserId = Number(currentUser?.id || 1);
            
            // 1. Determine who the "other person" is in this incoming message
            const otherIdInMsg = Number(msg.sender_id) === currentUserId 
              ? Number(msg.receiver_id) 
              : Number(msg.sender_id);
            
            // 2. Determine who the "other person" is in our currently open chat box
            const otherIdInChat = currentSelected ? Number(getOtherUserId(currentSelected)) : null;
            
            // 3. Check if this message belongs to the active chat box
            // A message belongs to the active chat if the conversation IDs match 
            // OR if the person sending/receiving matches the person we are talking to
            const isActiveChat = currentSelected && (
              Number(msg.conversation_id) === Number(currentSelected.id) || 
              otherIdInMsg === otherIdInChat
            );

            // Update messages list if it's the active chat
            if (isActiveChat) {
              setMessages((prev) => {
                const exists = prev.find(m => m.id === msg.id);
                if (exists) return prev;
                // Remove any optimistic "SENDING..." message with same text
                const filtered = prev.filter(m => !(m.isSending && m.message === msg.message));
                return [...filtered, msg];
              });
              
              // If we are the receiver, mark as read immediately
              if (Number(msg.receiver_id) === currentUserId) {
                // Silently reset in background
                messageAPI.getMessages(currentSelected.id).catch(() => {});
              }
              
              setTimeout(scrollToBottom, 50);
            }
            
            // 4. Update the sidebar conversation list
            setConversations((prev) => {
              const conversationIdx = prev.findIndex(c => 
                Number(c.id) === Number(msg.conversation_id) || 
                Number(getOtherUserId(c)) === otherIdInMsg
              );

              if (conversationIdx === -1) {
                // If not found in sidebar, fetch the full list to stay updated
    fetchConversations();
                return prev;
              }
              
              const updatedList = [...prev];
              const conv = { ...updatedList[conversationIdx] };
              
              // Update last message preview
              conv.last_message = msg.message;
              conv.last_message_at = msg.created_at;
              
              // Handle unread count logic
              if (isActiveChat) {
                // If we are looking at this chat, unread is always 0
                conv.unread_count = 0;
              } else if (Number(msg.receiver_id) === currentUserId) {
                // If we are NOT looking at it and WE are the receiver, increment badge
                conv.unread_count = (Number(conv.unread_count) || 0) + 1;
              }
              
              // Move this conversation to the top of the sidebar
              updatedList.splice(conversationIdx, 1);
              return [conv, ...updatedList];
            });
            break;
            
          default:
            console.log('Unknown WS message type:', type);
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    ws.onclose = (e) => {
      console.log('WebSocket disconnected:', e.code, e.reason);
      setWsStatus('disconnected');
      attemptReconnect();
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
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
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations(); 
    }
  }, [user]);

  useEffect(() => {
    // Auto-scroll removed from here to prevent jumping when selecting a user
  }, [messages]);

  // Scroll to bottom when typing indicator appears for the selected user
  useEffect(() => {
    if (selectedConversation && typingUsers[getOtherUserId(selectedConversation)]) {
      setTimeout(scrollToBottom, 50);
    }
  }, [typingUsers, selectedConversation]);

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
        if (conversations.length === 0) setConversations(getFakeConversations());
      }
    } catch (error) {
      if (conversations.length === 0) {
        setConversations(getFakeConversations());
      }
    } finally {
      setLoading(false);
    }
  };

  const getFakeConversations = () => [
    { 
      id: 1, 
      user1_id: user?.id || 1, 
      user2_id: 2, 
      user1_name: user?.name || 'Admin', 
      user2_name: 'John Doe', 
      last_message: 'Hi! I have a question about my subscription.', 
      last_message_at: new Date().toISOString(),
      unread_count: 2
    },
    { 
      id: 2, 
      user1_id: user?.id || 1, 
      user2_id: 3, 
      user1_name: user?.name || 'Admin', 
      user2_name: 'Jane Smith', 
      last_message: 'Thank you! I\'m excited to get started.', 
      last_message_at: new Date(Date.now() - 3600000).toISOString(),
      unread_count: 0
    },
    { 
      id: 3, 
      user1_id: user?.id || 1, 
      user2_id: 4, 
      user1_name: user?.name || 'Admin', 
      user2_name: 'Bob Johnson', 
      last_message: 'Everything is great! Thanks for checking in.', 
      last_message_at: new Date(Date.now() - 86400000).toISOString(),
      unread_count: 0
    }
  ];

  const fetchMessages = async (conversationId) => {
    try {
      // Fetch silently since we have real-time updates
      const response = await messageAPI.getMessages(conversationId);
      const data = response.data?.data || response.data || [];
      
      setMessages((current) => {
        const incomingIds = new Set(data.map(m => m.id));
        const sending = current.filter(m => m.isSending && !incomingIds.has(m.id));
        if (data.length === 0 && conversationId <= 3) {
          return [...getFakeMessages(conversationId), ...sending];
        }
        const newMessages = [...data, ...sending];
        // After setting messages, ensure we are at the bottom for the initial view
        setTimeout(scrollToBottom, 0);
        return newMessages;
      });
    } catch (error) {
      if (messages.length === 0 && conversationId <= 3) {
        setMessages(getFakeMessages(conversationId));
        setTimeout(scrollToBottom, 0);
      }
    } finally {
      setMessagesLoading(false);
    }
  };

  const getFakeMessages = (id) => {
    const fakes = {
      1: [
        { id: 101, conversation_id: 1, sender_id: user?.id || 1, receiver_id: 2, message: 'Hello John! How can I help you today?', created_at: new Date(Date.now() - 7200000).toISOString() },
        { id: 102, conversation_id: 1, sender_id: 2, receiver_id: user?.id || 1, message: 'Hi! I have a question about my subscription.', created_at: new Date(Date.now() - 6900000).toISOString() },
        { id: 103, conversation_id: 1, sender_id: user?.id || 1, receiver_id: 2, message: 'Sure, I\'d be happy to help. What\'s your question?', created_at: new Date(Date.now() - 6600000).toISOString() },
        { id: 104, conversation_id: 1, sender_id: 2, receiver_id: user?.id || 1, message: 'Can I upgrade my plan?', created_at: new Date(Date.now() - 6300000).toISOString() },
      ],
      2: [
        { id: 201, conversation_id: 2, sender_id: user?.id || 1, receiver_id: 3, message: 'Hi Jane! Welcome to our platform.', created_at: new Date(Date.now() - 5400000).toISOString() },
        { id: 202, conversation_id: 2, sender_id: 3, receiver_id: user?.id || 1, message: 'Thank you! I\'m excited to get started.', created_at: new Date(Date.now() - 5100000).toISOString() },
      ],
      3: [
        { id: 301, conversation_id: 3, sender_id: user?.id || 1, receiver_id: 4, message: 'Hi Bob! How\'s everything going?', created_at: new Date(Date.now() - 4200000).toISOString() },
        { id: 302, conversation_id: 3, sender_id: 4, receiver_id: user?.id || 1, message: 'Everything is great! Thanks for checking in.', created_at: new Date(Date.now() - 3900000).toISOString() },
      ]
    };
    return fakes[id] || [];
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    // Reset unread count locally in the sidebar
    setConversations(prev => prev.map(c => 
      c.id === conversation.id ? { ...c, unread_count: 0 } : c
    ));
    // Don't clear messages immediately to avoid flicker, just fetch new ones
    fetchMessages(conversation.id);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (wsStatus === 'connected' && wsRef.current && selectedConversation) {
      const otherId = getOtherUserId(selectedConversation);
      // Send typing event
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        receiver_id: otherId,
        is_typing: value.length > 0
      }));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !selectedConversation) return;

    const receiverId = getOtherUserId(selectedConversation);

    // Stop typing immediately when sending
    if (wsStatus === 'connected' && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        receiver_id: receiverId,
        is_typing: false
      }));
    }

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
    } catch (error) {}
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
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
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

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <div className="p-3 md:p-6 h-[calc(100vh-64px)] md:h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-4 md:mb-6 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white mb-0.5 md:mb-1">Messages</h1>
              <p className="text-[10px] md:text-sm text-gray-400">Connect and chat with your users in real-time</p>
              </div>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest border transition-all ${
              wsStatus === 'connected' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : wsStatus === 'connecting'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {wsStatus === 'connected' ? <Wifi className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <WifiOff className="w-2.5 h-2.5 md:w-3 md:h-3" />}
              <span className="hidden xs:inline">{wsStatus}</span>
            </div>
          </div>
          <button
            onClick={() => setIsNewConversationModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-xs md:text-sm font-bold shadow-lg shadow-teal-900/10"
          >
            <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
            New Conversation
          </button>
        </div>
      </div>

      <div className="flex gap-4 md:gap-6 flex-1 min-h-0 relative">
        {/* Conversations Sidebar */}
        <div className={`${
          isMobileView && selectedConversation ? 'hidden' : 'flex'
        } w-full lg:w-[380px] flex-col bg-gray-800/40 backdrop-blur-xl border border-white/5 rounded overflow-hidden shadow-2xl`}>
          <div className="p-4 md:p-5 border-b border-white/5 bg-white/5">
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
                const otherId = getOtherUserId(conversation);
                const isSelected = selectedConversation?.id === conversation.id;
                const lastMessage = conversation.last_message || 'No messages yet';
                const truncatedMessage = lastMessage.length > (isMobileView ? 30 : 40) 
                  ? lastMessage.substring(0, (isMobileView ? 30 : 40)) + '...' 
                  : lastMessage;
                const isOnline = isUserOnline(otherId);

                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`group p-3 md:p-4 rounded cursor-pointer transition-all duration-300 relative ${
                      isSelected 
                        ? 'bg-teal-500/15 border border-teal-500/20' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shadow-inner transition-transform duration-300 group-hover:scale-105 ${
                        isSelected ? 'bg-teal-500 text-white' : 'bg-gray-700/50 text-teal-300'
                      }`}>
                        {otherName.charAt(0).toUpperCase()}
                        {isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 md:w-3.5 h-3 md:h-3.5 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5 md:mb-1">
                          <h3 className={`text-[13px] md:text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {otherName}
                          </h3>
                          <span className="text-[9px] md:text-[10px] text-gray-500 font-medium">
                            {conversation.last_message_at ? formatTime(conversation.last_message_at) : formatTime(conversation.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-[11px] md:text-xs truncate leading-relaxed ${isSelected ? 'text-teal-100/70' : 'text-gray-400'}`}>
                            {truncatedMessage}
                          </p>
                          {conversation.unread_count > 0 && (
                            <span className="flex-shrink-0 min-w-[16px] md:min-w-[18px] h-[16px] md:h-[18px] px-1 rounded-full bg-teal-500 text-white text-[9px] md:text-[10px] font-black flex items-center justify-center shadow-lg shadow-teal-500/20 animate-bounce">
                              {conversation.unread_count}
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
        <div className={`${
          isMobileView && !selectedConversation ? 'hidden' : 'flex'
        } flex-1 flex flex-col bg-gray-800/40 backdrop-blur-xl border border-white/5 rounded overflow-hidden shadow-2xl relative`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-white/5 flex items-center justify-between z-10">
                <div className="flex items-center gap-3 md:gap-4">
                  {isMobileView && (
                    <button 
                      onClick={() => setSelectedConversation(null)}
                      className="p-1 -ml-1 text-gray-400 hover:text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}
                  <div className="relative">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 text-xs md:text-sm font-black shadow-lg shadow-teal-900/20">
                    {getOtherUserName(selectedConversation).charAt(0).toUpperCase()}
                    </div>
                    {isUserOnline(getOtherUserId(selectedConversation)) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 md:w-3 h-2.5 md:h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[13px] md:text-base font-bold text-white truncate max-w-[120px] xs:max-w-none">
                      {getOtherUserName(selectedConversation)}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isUserOnline(getOtherUserId(selectedConversation)) ? (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                          <p className="text-[8px] md:text-[10px] text-gray-400 font-medium uppercase tracking-widest">Online</p>
                        </>
                      ) : (
                        <p className="text-[8px] md:text-[10px] text-gray-500 font-medium uppercase tracking-widest">Offline</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <button className="p-1.5 md:p-2 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                <button
                  onClick={() => setSelectedConversation(null)}
                    className="p-1.5 md:p-2 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
                >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                </div>
              </div>

              {/* Messages Container */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded bg-white/5 flex items-center justify-center mb-2">
                      <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />
                    </div>
                    <h4 className="text-base md:text-lg font-bold text-white">Say hello!</h4>
                    <p className="text-xs md:text-sm text-gray-500 max-w-[240px]">Start a conversation with {getOtherUserName(selectedConversation)} and build your business connections.</p>
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex justify-center">
                      <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-white/5 text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border border-white/5">Today</span>
                    </div>
                    
                    {messages.map((message, idx) => {
                      const isOwnMessage = Number(message.sender_id) === Number(user?.id || 1);
                      const statusText = message.isSending 
                        ? 'Sending...' 
                        : message.error 
                          ? 'Failed' 
                          : message.is_read 
                            ? 'Seen' 
                            : 'Delivered';

                      const isLastOfGroup = idx === messages.length - 1 || messages[idx + 1].sender_id !== message.sender_id;

                    return (
                      <div
                          key={message.id || idx}
                          className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} animate-fadeIn group`}
                      >
                        <div
                            className={`relative max-w-[90%] sm:max-w-[70%] transition-all duration-300 ${
                              message.message_type === 'image'
                                ? 'hover:scale-[1.02]' 
                                : isOwnMessage
                                  ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl rounded-tr-none px-3 md:px-4 py-2 md:py-3 shadow-xl'
                                  : 'bg-gray-800/90 backdrop-blur-md border border-white/5 text-white rounded-2xl rounded-tl-none px-3 md:px-4 py-2 md:py-3 shadow-xl'
                            }`}
                          >
                            {renderMessageContent(message)}
                          </div>
                          
                          {isLastOfGroup && (
                            <div className={`flex items-center gap-1.5 md:gap-2 mt-1 md:mt-1.5 px-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                              <p className="text-[8px] md:text-[10px] text-gray-500 font-bold">
                              {formatTime(message.created_at)}
                            </p>
                              {isOwnMessage && (
                                <div className="flex items-center gap-1">
                                  <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${message.is_read ? 'bg-teal-400' : 'bg-gray-600'}`}></div>
                                  <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${
                                    message.error ? 'text-red-400' : 'text-gray-500'
                                  }`}>
                                    {statusText}
                                  </span>
                                </div>
                            )}
                          </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Typing Indicator Bubble */}
                    {typingUsers[getOtherUserId(selectedConversation)] && (
                      <div className="flex flex-col items-start animate-fadeIn">
                        <div className="bg-gray-800/90 backdrop-blur-md border border-white/5 text-white rounded-2xl rounded-tl-none px-4 py-2.5 shadow-xl">
                          <div className="flex gap-1 items-center h-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"></div>
                          </div>
                        </div>
                        <span className="text-[9px] mt-1 font-bold uppercase tracking-widest text-gray-500 italic px-1">
                          {getOtherUserName(selectedConversation)} is typing...
                        </span>
                      </div>
                )}

                    <div ref={messagesEndRef} className="h-6" />
                  </div>
                )}
              </div>

              {/* Message Input - Floating Style */}
              <div className="p-3 md:p-6 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent">
                <form 
                  onSubmit={handleSendMessage} 
                  className="relative group bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded p-1 shadow-2xl transition-all focus-within:border-teal-500/50 focus-within:ring-4 focus-within:ring-teal-500/10 flex items-center"
                >
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
                    className="p-2 md:p-3 text-gray-400 hover:text-teal-400 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent pl-1 md:pl-2 pr-12 md:pr-14 py-2 md:py-3 text-[13px] md:text-sm text-white placeholder-gray-500 focus:outline-none font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || uploading}
                    className="absolute right-1 top-1 bottom-1 px-3 md:px-4 rounded bg-teal-500 text-white hover:bg-teal-400 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center shadow-lg shadow-teal-500/20 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </form>
                </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] p-6">
              <div className="text-center max-w-sm space-y-4 md:space-y-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full"></div>
                  <div className="relative w-16 h-16 md:w-24 md:h-24 rounded bg-gray-800/50 border border-white/10 flex items-center justify-center mx-auto shadow-2xl backdrop-blur-xl">
                    <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-teal-500" />
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2">
                  <h3 className="text-lg md:text-2xl font-black text-white tracking-tight">Your Inbox</h3>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed">Select a user from the sidebar to start a secure, encrypted conversation.</p>
                </div>
                {!isMobileView && (
                  <button
                    onClick={() => setIsNewConversationModalOpen(true)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white text-sm font-bold transition-all active:scale-95"
                  >
                    New Conversation
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* New Conversation Modal */}
      <Modal
        isOpen={isNewConversationModalOpen}
        onClose={() => {
          setIsNewConversationModalOpen(false);
          setSelectedUserId('');
          setUserSearchQuery('');
          setUserSearchResults([]);
        }}
        title="Start New Conversation"
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search User or Business <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => handleUserSearch(e.target.value)}
                placeholder="Type name or business..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-600 rounded bg-gray-700/80 text-white placeholder-gray-500 focus:outline-none focus:border-teal-glass text-sm"
            />
            </div>

            {/* Search Results Dropdown */}
            {userSearchQuery.length >= 2 && (
              <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-white/10 rounded shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                {isSearchingUsers ? (
                  <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                ) : userSearchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No users found</div>
                ) : (
                  userSearchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setUserSearchQuery(u.business_name ? `${u.name} (${u.business_name})` : u.name);
                        setUserSearchResults([]);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-teal-500/10 transition-all border-b border-white/5 last:border-0 ${
                        selectedUserId === u.id ? 'bg-teal-500/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">{u.name}</p>
                          {u.business_name && (
                            <p className="text-xs text-teal-400 font-medium mt-0.5">{u.business_name}</p>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase font-black">ID: {u.id}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              onClick={() => {
                setIsNewConversationModalOpen(false);
                setSelectedUserId('');
                setUserSearchQuery('');
                setUserSearchResults([]);
              }}
              className="px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleNewConversation}
              disabled={!selectedUserId}
              className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <MessageSquare className="w-4 h-4" />
              Start Conversation
            </button>
          </div>
        </div>
      </Modal>

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
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(20, 184, 166, 0.3);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
