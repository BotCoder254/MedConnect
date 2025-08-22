import React from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiMoreVertical, FiVideo, FiPhone } from 'react-icons/fi';

const ChatHeader = ({ 
  chat, 
  currentUserId, 
  onBack,
  onVideoCall = null,
  onVoiceCall = null,
  onViewProfile = null
}) => {
  // Get the other participant (for 1-on-1 chats)
  const getOtherParticipant = () => {
    if (!chat || !chat.participants || !chat.participantsInfo) return null;
    
    const otherParticipantId = chat.participants.find(id => id !== currentUserId);
    return otherParticipantId ? chat.participantsInfo[otherParticipantId] : null;
  };
  
  const otherParticipant = getOtherParticipant();
  
  // Get participant status
  const getStatus = () => {
    if (!otherParticipant) return '';
    
    if (otherParticipant.isOnline) {
      return 'Online';
    }
    
    if (otherParticipant.lastSeen) {
      const lastSeen = new Date(otherParticipant.lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} min ago`;
      } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else {
        return lastSeen.toLocaleDateString();
      }
    }
    
    return '';
  };
  
  // Handle click on profile
  const handleProfileClick = () => {
    if (onViewProfile && otherParticipant) {
      onViewProfile(otherParticipant);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <div className="flex items-center">
        {/* Back button (for mobile) */}
        {onBack && (
          <button
            onClick={onBack}
            className="p-1 mr-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 md:hidden"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
        )}
        
        {/* Participant info */}
        <div 
          className="flex items-center cursor-pointer"
          onClick={handleProfileClick}
        >
          {/* Avatar */}
          {otherParticipant?.avatarUrl ? (
            <img
              src={otherParticipant.avatarUrl}
              alt={otherParticipant.displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
              {otherParticipant?.displayName?.charAt(0) || '?'}
            </div>
          )}
          
          {/* Name and status */}
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {otherParticipant?.displayName || 'Unknown User'}
            </h3>
            <div className="flex items-center">
              {otherParticipant?.isOnline && (
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getStatus()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center space-x-2">
        {/* Video call button */}
        {onVideoCall && (
          <button
            onClick={() => onVideoCall(otherParticipant)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
          >
            <FiVideo className="h-5 w-5" />
          </button>
        )}
        
        {/* Voice call button */}
        {onVoiceCall && (
          <button
            onClick={() => onVoiceCall(otherParticipant)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
          >
            <FiPhone className="h-5 w-5" />
          </button>
        )}
        
        {/* More options button */}
        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700">
          <FiMoreVertical className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
