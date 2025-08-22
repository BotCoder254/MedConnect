import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import { 
  subscribeToChatMessages, 
  sendMessage, 
  markMessagesAsRead, 
  setTypingIndicator,
  uploadAttachment,
  deleteMessage
} from '../../services/ChatService';

const ChatInterface = ({ 
  chat, 
  onBack,
  onVideoCall = null,
  onVoiceCall = null,
  onViewProfile = null
}) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  
  // Debounced typing indicator
  const debouncedSetTyping = useCallback(
    debounce((chatId, userId, isTyping) => {
      setTypingIndicator(chatId, userId, isTyping).catch(console.error);
    }, 500),
    []
  );
  
  // Subscribe to messages
  useEffect(() => {
    if (!chat?.id || !currentUser) return;
    
    // Subscribe to messages
    const unsubscribe = subscribeToChatMessages(chat.id, (newMessages) => {
      setMessages(newMessages);
      
      // Mark messages as read
      const unreadMessages = newMessages.filter(
        msg => msg.senderId !== currentUser.uid && (!msg.readBy || !msg.readBy[currentUser.uid])
      );
      
      if (unreadMessages.length > 0) {
        markMessagesAsRead(
          chat.id, 
          currentUser.uid, 
          unreadMessages.map(msg => msg.id)
        ).catch(console.error);
      }
    });
    
    // Subscribe to typing indicators
    const chatRef = doc(db, `chats/${chat.id}`);
    const typingUnsubscribe = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        const chatData = doc.data();
        if (chatData.typingUsers) {
          setTypingUsers(chatData.typingUsers);
        }
      }
    });
    
    return () => {
      unsubscribe();
      typingUnsubscribe();
      // Clear typing indicator when leaving chat
      setTypingIndicator(chat.id, currentUser.uid, false).catch(console.error);
    };
  }, [chat?.id, currentUser]);
  
  // Handle typing indicator
  useEffect(() => {
    if (!chat?.id || !currentUser) return;
    
    debouncedSetTyping(chat.id, currentUser.uid, isTyping);
    
    return () => {
      debouncedSetTyping.cancel();
    };
  }, [chat?.id, currentUser, isTyping, debouncedSetTyping]);
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ text, attachments }) => {
      return sendMessage(chat.id, currentUser.uid, text, attachments);
    },
    onSuccess: () => {
      // No need to invalidate queries as we're using real-time listeners
    }
  });
  
  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId) => {
      return deleteMessage(chat.id, messageId);
    }
  });
  
  // Handle sending message
  const handleSendMessage = async (text, attachmentPreviews) => {
    if (!chat?.id || !currentUser) return;
    
    try {
      // Upload attachments if any
      let attachments = [];
      if (attachmentPreviews.length > 0) {
        setIsUploading(true);
        
        // Upload each attachment
        const uploadPromises = attachmentPreviews.map(async (preview) => {
          try {
            return await uploadAttachment(preview.file, chat.id, currentUser.uid);
          } catch (error) {
            console.error('Error uploading attachment:', error);
            return null;
          }
        });
        
        // Wait for all uploads to complete
        const uploadedAttachments = await Promise.all(uploadPromises);
        attachments = uploadedAttachments.filter(Boolean); // Remove nulls
        
        setIsUploading(false);
      }
      
      // Send the message
      await sendMessageMutation.mutateAsync({ text, attachments });
      
      // Clear typing indicator
      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsUploading(false);
    }
  };
  
  // Handle typing indicator
  const handleTyping = (isTyping) => {
    setIsTyping(isTyping);
  };
  
  // Handle delete message
  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessageMutation.mutate(messageId);
    }
  };
  
  // If no chat is selected
  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No chat selected</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-white dark:bg-gray-800"
    >
      {/* Chat header */}
      <ChatHeader
        chat={chat}
        currentUserId={currentUser?.uid}
        onBack={onBack}
        onVideoCall={onVideoCall}
        onVoiceCall={onVoiceCall}
        onViewProfile={onViewProfile}
      />
      
      {/* Message list */}
      <ChatMessageList
        messages={messages}
        isLoading={false}
        typingUsers={typingUsers}
        onDeleteMessage={handleDeleteMessage}
      />
      
      {/* Chat input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        isLoading={sendMessageMutation.isLoading || isUploading}
        isMobile={window.innerWidth < 768}
      />
    </motion.div>
  );
};

// Debounce helper function
function debounce(func, wait) {
  let timeout;
  
  const debounced = (...args) => {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  
  debounced.cancel = () => {
    clearTimeout(timeout);
  };
  
  return debounced;
}

export default ChatInterface;
