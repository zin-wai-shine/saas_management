import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import { Dropdown } from '../../components/Dropdown';
import { Toast, ToastContainer } from '../../components/Toast';
import { messageAPI } from '../../api/api';
import {
  Search,
  Send,
  MessageSquare,
  UserPlus,
  X,
  ChevronLeft,
  Clock,
} from 'lucide-react';

export const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [toasts, setToasts] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    // Refresh conversations every 30 seconds
    const interval = setInterval(() => {
      if (!messagesLoading) {
        fetchConversations();
        if (selectedConversation) {
          fetchMessages(selectedConversation.id);
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.listConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };


  const fetchMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const response = await messageAPI.getMessages(conversationId);
      setMessages(response.data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const receiverId = selectedConversation.user1_id === user.id 
        ? selectedConversation.user2_id 
        : selectedConversation.user1_id;

      await messageAPI.sendMessage({
        receiver_id: receiverId,
        message: newMessage.trim(),
      });

      setNewMessage('');
      // Refresh messages and conversations
      await fetchMessages(selectedConversation.id);
      await fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast('Failed to send message', 'error');
    }
  };

  const handleNewConversation = async () => {
    if (!selectedUserId) {
      showToast('Please select a user', 'error');
      return;
    }

    try {
      const response = await messageAPI.getOrCreateConversation(parseInt(selectedUserId));
      const conversation = response.data;
      setSelectedConversation(conversation);
      setIsNewConversationModalOpen(false);
      setSelectedUserId('');
      await fetchConversations();
      await fetchMessages(conversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      showToast('Failed to create conversation', 'error');
    }
  };

  const getOtherUserName = (conversation) => {
    if (conversation.user1_id === user.id) {
      return conversation.user2_name || 'User';
    }
    return conversation.user1_name || 'User';
  };

  const getOtherUserId = (conversation) => {
    if (conversation.user1_id === user.id) {
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
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherName = getOtherUserName(conv).toLowerCase();
    return otherName.includes(searchFilter.toLowerCase());
  });

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-4">Messages</h1>
        
        {/* Search and Action Button Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search */}
          <div className="flex items-center gap-3 flex-1">
            <div className="min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded bg-gray-700/80 text-white placeholder-gray-500 focus:outline-none focus:border-teal-glass text-sm"
                />
              </div>
            </div>
          </div>

          {/* Right: Action Button */}
          <button
            onClick={() => setIsNewConversationModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            New Conversation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-gray-800 border border-gray-700 rounded overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-white">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No conversations found</div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherName = getOtherUserName(conversation);
                const isSelected = selectedConversation?.id === conversation.id;
                const lastMessage = conversation.last_message || 'No messages yet';
                const truncatedMessage = lastMessage.length > 50 
                  ? lastMessage.substring(0, 50) + '...' 
                  : lastMessage;

                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-teal-500/10 border-l-4 border-teal-glass' 
                        : 'hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-500/10 backdrop-blur-md border border-teal-500/20 flex items-center justify-center text-teal-300 text-sm font-semibold flex-shrink-0">
                        {otherName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-white truncate">{otherName}</h3>
                          {conversation.unread_count > 0 && (
                            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{truncatedMessage}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(conversation.last_message_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-500/10 backdrop-blur-md border border-teal-500/20 flex items-center justify-center text-teal-300 text-sm font-semibold">
                    {getOtherUserName(selectedConversation).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {getOtherUserName(selectedConversation)}
                    </h3>
                    <p className="text-xs text-gray-400">Active</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages List */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messagesLoading ? (
                  <div className="text-center text-gray-400">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-8">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = message.sender_id === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwnMessage
                              ? 'bg-teal-glass/20 border border-teal-glass/30 text-white'
                              : 'bg-gray-700/50 border border-gray-600/30 text-white'
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs text-teal-300 mb-1 font-medium">
                              {message.sender_name || 'User'}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-400">
                              {formatTime(message.created_at)}
                            </p>
                            {isOwnMessage && message.is_read && (
                              <span className="text-xs text-teal-300">✓ Read</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-600 rounded bg-gray-700/80 text-white placeholder-gray-500 focus:outline-none focus:border-teal-glass text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2 rounded bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 text-white hover:bg-teal-glass/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <Modal
        isOpen={isNewConversationModalOpen}
        onClose={() => {
          setIsNewConversationModalOpen(false);
          setSelectedUserId('');
        }}
        title="Start New Conversation"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select User <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              placeholder="Enter user ID"
              className="w-full px-4 py-2 border border-gray-600 rounded bg-gray-700/80 text-white placeholder-gray-500 focus:outline-none focus:border-teal-glass text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter the user ID you want to message
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setIsNewConversationModalOpen(false);
                setSelectedUserId('');
              }}
              className="px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md hover:bg-gray-800/30 text-white transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleNewConversation}
              className="flex items-center gap-2 px-4 py-2 bg-teal-glass/20 backdrop-blur-md border border-teal-glass/30 rounded text-white hover:bg-teal-glass/30 transition-all text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              Start Conversation
            </button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} removeToast={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
};

