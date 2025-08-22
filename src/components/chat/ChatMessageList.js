import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock } from 'react-icons/fi';
import ChatMessage from './ChatMessage';
import { groupMessagesByDate } from '../../models/ChatModels';
import { useAuth } from '../../context/AuthContext';

const ChatMessageList = ({ 
  messages, 
  isLoading, 
  typingUsers = {},
  onDeleteMessage
}) => {
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);
  
  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages || []);
  
  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };
  
  // Check if a message is from the current user
  const isFromCurrentUser = (message) => {
    return message.senderId === currentUser?.uid;
  };
  
  // Check if a message is from the same sender as the previous one
  const isPreviousSameSender = (message, index, messagesInGroup) => {
    if (index === 0) return false;
    return message.senderId === messagesInGroup[index - 1].senderId;
  };
  
  // Render typing indicators
  const renderTypingIndicators = () => {
    const typingUserIds = Object.keys(typingUsers).filter(id => 
      typingUsers[id] && id !== currentUser?.uid
    );
    
    if (typingUserIds.length === 0) return null;
    
    return (
      <div className="flex items-end mb-2">
        <div className="flex-shrink-0 mr-2">
          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <FiClock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
        <div className="rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none">
          <div className="flex items-center">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="ml-2 text-sm">
              {typingUserIds.length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No messages yet</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Start the conversation by sending a message.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {/* Message groups by date */}
      {Object.entries(groupedMessages).map(([dateStr, messagesInGroup]) => (
        <div key={dateStr} className="mb-6">
          {/* Date header */}
          <div className="flex justify-center mb-4">
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
              {formatDate(dateStr)}
            </div>
          </div>
          
          {/* Messages */}
          <AnimatePresence initial={false}>
            {messagesInGroup.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isCurrentUser={isFromCurrentUser(message)}
                showAvatar={!isPreviousSameSender(message, index, messagesInGroup)}
                previousSameSender={isPreviousSameSender(message, index, messagesInGroup)}
                onDelete={onDeleteMessage}
              />
            ))}
          </AnimatePresence>
        </div>
      ))}
      
      {/* Typing indicators */}
      {renderTypingIndicators()}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
      
      {/* Styling for typing indicator */}
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 1px;
          background-color: #8B5CF6;
          border-radius: 50%;
          display: inline-block;
          opacity: 0.6;
        }
        
        .typing-indicator span:nth-child(1) {
          animation: bounce 1s infinite;
        }
        
        .typing-indicator span:nth-child(2) {
          animation: bounce 1s infinite 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation: bounce 1s infinite 0.4s;
        }
        
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatMessageList;
