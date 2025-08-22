import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import ChatList from '../components/chat/ChatList';
import ChatInterface from '../components/chat/ChatInterface';
import { subscribeToUserChats, getOrCreateChat } from '../services/ChatService';

const Messaging = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showChatList, setShowChatList] = useState(!chatId);
  
  // Listen for window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      
      // On desktop, always show both panels
      if (!mobile) {
        setShowChatList(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Subscribe to user chats
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = subscribeToUserChats(currentUser.uid, (userChats) => {
      setChats(userChats);
      
      // If a chat ID is provided in the URL, select that chat
      if (chatId) {
        const chat = userChats.find(c => c.id === chatId);
        if (chat) {
          setSelectedChat(chat);
          
          // On mobile, hide the chat list when a chat is selected
          if (isMobileView) {
            setShowChatList(false);
          }
        }
      }
    });
    
    return () => unsubscribe();
  }, [currentUser, chatId, isMobileView]);
  
  // Handle chat selection
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    navigate(`/messaging/${chat.id}`);
    
    // On mobile, hide the chat list when a chat is selected
    if (isMobileView) {
      setShowChatList(false);
    }
  };
  
  // Handle back button (mobile)
  const handleBack = () => {
    setShowChatList(true);
    navigate('/messaging');
  };
  
  // Handle new chat
  const handleNewChat = () => {
    // In a real app, this would open a modal to select a user
    // For demo purposes, we'll just create a chat with a sample user
    if (!currentUser) return;
    
    // This is just a placeholder - in a real app, you would have a proper UI to select a user
    const sampleDoctorId = 'sample-doctor-id';
    const sampleDoctorInfo = {
      displayName: 'Dr. Sample',
      role: 'doctor',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
    };
    
    getOrCreateChat(
      currentUser.uid,
      sampleDoctorId,
      {
        displayName: userProfile?.displayName || 'User',
        role: userProfile?.role || 'patient',
        avatarUrl: userProfile?.avatarUrl || ''
      },
      sampleDoctorInfo
    ).then(chatId => {
      navigate(`/messaging/${chatId}`);
    }).catch(error => {
      console.error('Error creating chat:', error);
    });
  };
  
  // Handle view profile
  const handleViewProfile = (participant) => {
    if (participant.role === 'doctor') {
      navigate(`/doctors/${participant.uid}`);
    } else {
      // For patients, you might have a different route
      // navigate(`/patients/${participant.uid}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Messages</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[calc(100vh-12rem)]">
          <div className="flex h-full">
            {/* Chat list (always visible on desktop, toggleable on mobile) */}
            {(showChatList || !isMobileView) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${isMobileView ? 'w-full' : 'w-1/3 border-r border-gray-200 dark:border-gray-700'}`}
              >
                <ChatList
                  chats={chats}
                  selectedChatId={selectedChat?.id}
                  onSelectChat={handleSelectChat}
                  onNewChat={handleNewChat}
                  isLoading={false}
                />
              </motion.div>
            )}
            
            {/* Chat interface (always visible on desktop, toggleable on mobile) */}
            {(!showChatList || !isMobileView) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${isMobileView ? 'w-full' : 'w-2/3'}`}
              >
                <ChatInterface
                  chat={selectedChat}
                  onBack={isMobileView ? handleBack : null}
                  onViewProfile={handleViewProfile}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
