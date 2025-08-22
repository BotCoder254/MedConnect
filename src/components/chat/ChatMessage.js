import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDownload, 
  FiFile, 
  FiFileText, 
  FiImage, 
  FiVideo, 
  FiMusic,
  FiCheck, 
  FiCheckCircle,
  FiTrash2,
  FiClock
} from 'react-icons/fi';
import { formatMessageTimestamp, formatFileSize, getFileTypeIcon } from '../../models/ChatModels';

const ChatMessage = ({ 
  message, 
  isCurrentUser, 
  showAvatar = true, 
  previousSameSender = false,
  onDelete = null
}) => {
  const [showActions, setShowActions] = useState(false);
  
  // Get sender info
  const sender = message.sender || { displayName: 'Unknown', avatarUrl: '' };
  
  // Format timestamp
  const timestamp = formatMessageTimestamp(message.createdAt);
  
  // Message status icon
  const getStatusIcon = () => {
    if (isCurrentUser) {
      switch (message.status) {
        case 'sending':
          return <FiClock className="h-3 w-3 text-gray-400" />;
        case 'sent':
          return <FiCheck className="h-3 w-3 text-gray-400" />;
        case 'delivered':
          return <div className="flex"><FiCheck className="h-3 w-3 text-gray-400" /><FiCheck className="h-3 w-3 text-gray-400 -ml-1" /></div>;
        case 'read':
          return <FiCheckCircle className="h-3 w-3 text-blue-500" />;
        case 'error':
          return <span className="text-xs text-red-500">!</span>;
        default:
          return null;
      }
    }
    return null;
  };
  
  // Handle message actions
  const handleMessageClick = () => {
    if (isCurrentUser && !message.isDeleted) {
      setShowActions(!showActions);
    }
  };
  
  // Handle delete message
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(message.id);
    }
    setShowActions(false);
  };
  
  // Get file icon based on type
  const getFileIcon = (attachment) => {
    const iconType = getFileTypeIcon(attachment.contentType);
    
    switch (iconType) {
      case 'image':
        return <FiImage className="h-5 w-5" />;
      case 'video':
        return <FiVideo className="h-5 w-5" />;
      case 'music':
        return <FiMusic className="h-5 w-5" />;
      case 'file-text':
        return <FiFileText className="h-5 w-5" />;
      default:
        return <FiFile className="h-5 w-5" />;
    }
  };
  
  // Animation variants
  const messageVariants = {
    initial: { 
      opacity: 0,
      x: isCurrentUser ? 20 : -20,
      scale: 0.95
    },
    animate: { 
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 500,
        damping: 30
      }
    },
    exit: { 
      opacity: 0,
      x: isCurrentUser ? 20 : -20,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <motion.div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className={`flex items-end ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isCurrentUser && showAvatar && !previousSameSender && (
          <div className="flex-shrink-0 mr-2">
            {sender.avatarUrl ? (
              <img 
                src={sender.avatarUrl} 
                alt={sender.displayName} 
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm">
                {sender.displayName?.charAt(0) || '?'}
              </div>
            )}
          </div>
        )}
        
        {/* Message bubble */}
        <div 
          className={`relative max-w-xs md:max-w-md ${previousSameSender ? (isCurrentUser ? 'mr-10' : 'ml-10') : ''}`}
          onClick={handleMessageClick}
        >
          {/* Message actions */}
          {showActions && (
            <div className="absolute -top-8 right-0 bg-white dark:bg-gray-800 rounded-full shadow-md flex">
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {/* Message content */}
          <div
            className={`rounded-lg px-3 py-2 ${
              isCurrentUser 
                ? 'bg-primary-500 text-white rounded-br-none' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
            } ${message.isDeleted ? 'italic opacity-70' : ''}`}
          >
            {/* Sender name for group chats (not needed in 1-on-1 chats) */}
            {!isCurrentUser && !previousSameSender && (
              <div className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-300">
                {sender.displayName}
              </div>
            )}
            
            {/* Message text */}
            {message.text && (
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
            )}
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && !message.isDeleted && (
              <div className="mt-1 space-y-2">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="rounded overflow-hidden">
                    {/* Images */}
                    {attachment.type === 'image' && (
                      <div className="relative group">
                        <img 
                          src={attachment.url} 
                          alt={attachment.name}
                          className="max-h-60 rounded object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <a 
                            href={attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            download={attachment.name}
                            className="p-2 bg-white rounded-full shadow-md"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiDownload className="h-5 w-5 text-gray-700" />
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {/* Videos */}
                    {attachment.type === 'video' && (
                      <div className="relative">
                        <video 
                          src={attachment.url} 
                          controls
                          className="max-h-60 rounded w-full"
                        />
                      </div>
                    )}
                    
                    {/* Documents */}
                    {(attachment.type !== 'image' && attachment.type !== 'video') && (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={attachment.name}
                        onClick={(e) => e.stopPropagation()}
                        className={`flex items-center p-2 rounded bg-opacity-10 ${
                          isCurrentUser 
                            ? 'bg-white text-white' 
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white'
                        }`}
                      >
                        <div className={`p-2 rounded-full mr-2 ${
                          isCurrentUser 
                            ? 'bg-white bg-opacity-20' 
                            : 'bg-gray-300 dark:bg-gray-500'
                        }`}>
                          {getFileIcon(attachment)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm font-medium">
                            {attachment.name}
                          </div>
                          <div className="text-xs opacity-70">
                            {formatFileSize(attachment.size)}
                          </div>
                        </div>
                        <FiDownload className={`h-4 w-4 ml-2 ${
                          isCurrentUser 
                            ? 'text-white' 
                            : 'text-gray-500 dark:text-gray-300'
                        }`} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Message metadata */}
            <div className={`text-xs mt-1 flex justify-end items-center space-x-1 ${
              isCurrentUser ? 'text-white text-opacity-70' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span>{timestamp}</span>
              <span>{getStatusIcon()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
