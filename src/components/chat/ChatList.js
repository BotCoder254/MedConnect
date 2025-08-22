import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiEdit, FiMessageCircle } from 'react-icons/fi';
import { formatMessageTimestamp } from '../../models/ChatModels';
import { useAuth } from '../../context/AuthContext';

const ChatList = ({ 
  chats, 
  selectedChatId, 
  onSelectChat, 
  onNewChat = null,
  isLoading = false 
}) => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get the other participant in a chat (for 1-on-1 chats)
  const getOtherParticipant = (chat) => {
    if (!chat || !chat.participants || !chat.participantsInfo) return null;
    
    const otherParticipantId = chat.participants.find(id => id !== currentUser?.uid);
    return otherParticipantId ? chat.participantsInfo[otherParticipantId] : null;
  };
  
  // Filter chats based on search query
  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    
    const otherParticipant = getOtherParticipant(chat);
    const participantName = otherParticipant?.displayName || '';
    const lastMessage = chat.lastMessage?.text || '';
    
    return (
      participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="mb-4 relative">
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center p-3 rounded-lg animate-pulse">
              <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Empty state
  if (chats.length === 0) {
    return (
      <div className="p-4 h-full flex flex-col">
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
              <FiMessageCircle className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No conversations yet</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Start a new conversation with a doctor or patient.
            </p>
            
            {onNewChat && (
              <button
                onClick={onNewChat}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiEdit className="mr-2 -ml-1 h-4 w-4" />
                New Message
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 h-full flex flex-col">
      {/* Search bar */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
        />
        <FiSearch className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" />
      </div>
      
      {/* New message button */}
      {onNewChat && (
        <button
          onClick={onNewChat}
          className="mb-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <FiEdit className="mr-2 -ml-1 h-4 w-4" />
          New Message
        </button>
      )}
      
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {filteredChats.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <p className="text-gray-500 dark:text-gray-400">No conversations found</p>
            </motion.div>
          ) : (
            filteredChats.map(chat => {
              const otherParticipant = getOtherParticipant(chat);
              const isSelected = selectedChatId === chat.id;
              const hasUnread = chat.lastMessage && 
                chat.lastMessage.senderId !== currentUser?.uid && 
                !chat.lastMessage.isRead;
              
              return (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onSelectChat(chat)}
                  className={`flex items-center p-3 rounded-lg cursor-pointer mb-1 ${
                    isSelected 
                      ? 'bg-primary-50 dark:bg-primary-900/20' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    {otherParticipant?.avatarUrl ? (
                      <img
                        src={otherParticipant.avatarUrl}
                        alt={otherParticipant.displayName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center text-white">
                        {otherParticipant?.displayName?.charAt(0) || '?'}
                      </div>
                    )}
                    
                    {/* Online indicator */}
                    {otherParticipant?.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
                    )}
                  </div>
                  
                  {/* Chat info */}
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className={`text-sm font-medium truncate ${
                        isSelected 
                          ? 'text-primary-700 dark:text-primary-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {otherParticipant?.displayName || 'Unknown User'}
                      </h3>
                      {chat.lastMessage?.createdAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          {formatMessageTimestamp(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <p className={`text-sm truncate ${
                        hasUnread 
                          ? 'font-medium text-gray-900 dark:text-white' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {chat.lastMessage?.text || 'No messages yet'}
                      </p>
                      
                      {/* Unread indicator */}
                      {hasUnread && (
                        <span className="ml-2 h-2 w-2 rounded-full bg-primary-500"></span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatList;
