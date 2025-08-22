import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSend, 
  FiPaperclip, 
  FiImage, 
  FiFile, 
  FiX, 
  FiSmile,
  FiCamera
} from 'react-icons/fi';
import { formatFileSize } from '../../models/ChatModels';

const ChatInput = ({ 
  onSendMessage, 
  onTyping = null,
  isLoading = false,
  isMobile = false
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Focus the textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  // Handle typing indicator
  useEffect(() => {
    if (onTyping && message.length > 0) {
      onTyping(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    } else if (onTyping && message.length === 0) {
      onTyping(false);
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, onTyping]);
  
  // Handle message input change
  const handleChange = (e) => {
    setMessage(e.target.value);
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Handle send message
  const handleSend = () => {
    if ((message.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle camera capture (mobile)
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = 'environment';
      fileInputRef.current.click();
    }
  };
  
  // Handle image selection
  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };
  
  // Handle document selection
  const handleDocumentSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };
  
  // Process files
  const handleFiles = (files) => {
    // Limit to 5 files at once
    const newFiles = files.slice(0, 5);
    
    // Create preview for each file
    const fileObjects = newFiles.map(file => ({
      file,
      id: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setAttachments([...attachments, ...fileObjects]);
    setShowAttachMenu(false);
  };
  
  // Remove attachment
  const removeAttachment = (id) => {
    setAttachments(attachments.filter(attachment => attachment.id !== id));
  };
  
  // Get attachment preview
  const getAttachmentPreview = (attachment) => {
    if (attachment.type.startsWith('image/')) {
      return (
        <div className="relative h-16 w-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img 
            src={attachment.id} 
            alt={attachment.name}
            className="h-full w-full object-cover"
          />
          <button
            onClick={() => removeAttachment(attachment.id)}
            className="absolute top-0 right-0 p-1 bg-black bg-opacity-50 rounded-bl text-white"
          >
            <FiX className="h-3 w-3" />
          </button>
        </div>
      );
    }
    
    return (
      <div className="relative flex items-center p-2 rounded bg-gray-100 dark:bg-gray-700 max-w-xs">
        <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 mr-2">
          <FiFile className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
            {attachment.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(attachment.size)}
          </div>
        </div>
        <button
          onClick={() => removeAttachment(attachment.id)}
          className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    );
  };
  
  return (
    <div 
      className={`p-4 border-t border-gray-200 dark:border-gray-700 ${dragActive ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map(attachment => (
            <div key={attachment.id}>
              {getAttachmentPreview(attachment)}
            </div>
          ))}
        </div>
      )}
      
      {/* Input area */}
      <div className="flex items-end space-x-2">
        {/* Attachment button */}
        <div className="relative">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          >
            <FiPaperclip className="h-5 w-5" />
          </button>
          
          {/* Attachment menu */}
          <AnimatePresence>
            {showAttachMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 w-40"
              >
                <button
                  onClick={handleImageSelect}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiImage className="h-4 w-4 mr-2" />
                  Image
                </button>
                
                {isMobile && (
                  <button
                    onClick={handleCameraCapture}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiCamera className="h-4 w-4 mr-2" />
                    Camera
                  </button>
                )}
                
                <button
                  onClick={handleDocumentSelect}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiFile className="h-4 w-4 mr-2" />
                  Document
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Emoji button (placeholder) */}
        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none">
          <FiSmile className="h-5 w-5" />
        </button>
        
        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none py-2 px-3 max-h-32"
            rows={1}
            style={{ minHeight: '40px' }}
          />
        </div>
        
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isLoading || (message.trim() === '' && attachments.length === 0)}
          className={`p-2 rounded-full ${
            isLoading || (message.trim() === '' && attachments.length === 0)
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-gray-200 dark:border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiSend className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />
    </div>
  );
};

export default ChatInput;
