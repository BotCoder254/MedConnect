import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get or create a chat between users
 * 
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @param {Object} user1Info - First user info (name, role, avatar)
 * @param {Object} user2Info - Second user info (name, role, avatar)
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<string>} - Chat ID
 */
export const getOrCreateChat = async (userId1, userId2, user1Info, user2Info, metadata = {}) => {
  try {
    // Check if chat already exists
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId1)
    );
    
    const querySnapshot = await getDocs(q);
    const existingChat = querySnapshot.docs.find(doc => {
      const data = doc.data();
      return data.participants.includes(userId2);
    });
    
    if (existingChat) {
      return existingChat.id;
    }
    
    // Create a new chat
    const participants = [userId1, userId2];
    const participantsInfo = {
      [userId1]: user1Info,
      [userId2]: user2Info
    };
    
    const chatData = {
      participants,
      participantsInfo,
      lastMessage: {
        text: '',
        senderId: '',
        createdAt: null,
        isRead: false
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      metadata: {
        ...metadata,
        isActive: true
      }
    };
    
    const chatRef = await addDoc(chatsRef, chatData);
    return chatRef.id;
  } catch (error) {
    console.error('Error getting or creating chat:', error);
    throw error;
  }
};

/**
 * Get chats for a user
 * 
 * @param {string} userId - User ID
 * @param {number} limitCount - Maximum number of chats to return
 * @returns {Promise<Array>} - Array of chats
 */
export const getUserChats = async (userId, limitCount = 20) => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

/**
 * Subscribe to user chats
 * 
 * @param {string} userId - User ID
 * @param {function} callback - Callback function for updates
 * @param {number} limitCount - Maximum number of chats to return
 * @returns {function} - Unsubscribe function
 */
export const subscribeToUserChats = (userId, callback, limitCount = 20) => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(chats);
    }, (error) => {
      console.error('Error subscribing to user chats:', error);
    });
  } catch (error) {
    console.error('Error setting up chat subscription:', error);
    throw error;
  }
};

/**
 * Send a message
 * 
 * @param {string} chatId - Chat ID
 * @param {string} senderId - Sender ID
 * @param {string} text - Message text
 * @param {Array} attachments - Array of attachments
 * @param {string} replyToId - Optional message ID to reply to
 * @returns {Promise<string>} - Message ID
 */
export const sendMessage = async (chatId, senderId, text, attachments = [], replyToId = null) => {
  try {
    const messageData = {
      chatId,
      senderId,
      text,
      attachments,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      readBy: {},
      status: 'sent',
      isDeleted: false,
      replyTo: replyToId,
      metadata: {}
    };
    
    // Add the message to the messages subcollection
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const messageRef = await addDoc(messagesRef, messageData);
    
    // Update the chat's lastMessage
    const chatRef = doc(db, `chats/${chatId}`);
    await updateDoc(chatRef, {
      'lastMessage.text': text || (attachments.length > 0 ? 'Sent an attachment' : ''),
      'lastMessage.senderId': senderId,
      'lastMessage.createdAt': serverTimestamp(),
      'lastMessage.isRead': false,
      updatedAt: serverTimestamp()
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get messages for a chat
 * 
 * @param {string} chatId - Chat ID
 * @param {number} limitCount - Maximum number of messages to return
 * @returns {Promise<Array>} - Array of messages
 */
export const getChatMessages = async (chatId, limitCount = 50) => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

/**
 * Subscribe to chat messages
 * 
 * @param {string} chatId - Chat ID
 * @param {function} callback - Callback function for updates
 * @param {number} limitCount - Maximum number of messages to return
 * @returns {function} - Unsubscribe function
 */
export const subscribeToChatMessages = (chatId, callback, limitCount = 50) => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse(); // Reverse to get chronological order
      callback(messages);
    }, (error) => {
      console.error('Error subscribing to chat messages:', error);
    });
  } catch (error) {
    console.error('Error setting up message subscription:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 * 
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 * @param {Array} messageIds - Array of message IDs to mark as read
 * @returns {Promise<void>}
 */
export const markMessagesAsRead = async (chatId, userId, messageIds = []) => {
  try {
    const readTimestamp = serverTimestamp();
    const batch = db.batch();
    
    // If no specific message IDs are provided, mark all unread messages as read
    if (messageIds.length === 0) {
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      const q = query(
        messagesRef,
        where(`readBy.${userId}`, '==', null)
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.docs.forEach(doc => {
        const messageRef = doc.ref;
        batch.update(messageRef, {
          [`readBy.${userId}`]: readTimestamp,
          status: 'read'
        });
      });
    } else {
      // Mark specific messages as read
      messageIds.forEach(messageId => {
        const messageRef = doc(db, `chats/${chatId}/messages/${messageId}`);
        batch.update(messageRef, {
          [`readBy.${userId}`]: readTimestamp,
          status: 'read'
        });
      });
    }
    
    // Update the chat's lastMessage if it was from the other user
    const chatRef = doc(db, `chats/${chatId}`);
    const chatDoc = await getDoc(chatRef);
    const chatData = chatDoc.data();
    
    if (chatData.lastMessage.senderId !== userId) {
      batch.update(chatRef, {
        'lastMessage.isRead': true
      });
    }
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Set typing indicator
 * 
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 * @param {boolean} isTyping - Whether the user is typing
 * @returns {Promise<void>}
 */
export const setTypingIndicator = async (chatId, userId, isTyping) => {
  try {
    const chatRef = doc(db, `chats/${chatId}`);
    
    if (isTyping) {
      await updateDoc(chatRef, {
        [`typingUsers.${userId}`]: serverTimestamp()
      });
    } else {
      await updateDoc(chatRef, {
        [`typingUsers.${userId}`]: null
      });
    }
  } catch (error) {
    console.error('Error setting typing indicator:', error);
    throw error;
  }
};

/**
 * Upload attachment
 * 
 * @param {File} file - File to upload
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Attachment object
 */
export const uploadAttachment = async (file, chatId, userId) => {
  try {
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = `chats/${chatId}/attachments/${fileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, filePath);
    
    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Return a promise that resolves with the attachment object
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress monitoring can be implemented here
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress}%`);
        },
        (error) => {
          // Handle upload errors
          console.error('Error uploading file:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Create attachment object
            const attachment = {
              id: fileId,
              type: file.type.startsWith('image/') ? 'image' : 
                   file.type.startsWith('video/') ? 'video' :
                   'document',
              url: downloadURL,
              thumbnailUrl: file.type.startsWith('image/') ? downloadURL : null,
              name: file.name,
              size: file.size,
              contentType: file.type,
              metadata: {
                uploadedBy: userId,
                uploadedAt: new Date().toISOString()
              }
            };
            
            resolve(attachment);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error setting up file upload:', error);
    throw error;
  }
};

/**
 * Delete attachment
 * 
 * @param {string} attachmentUrl - URL of the attachment to delete
 * @returns {Promise<void>}
 */
export const deleteAttachment = async (attachmentUrl) => {
  try {
    // Create a reference to the file to delete
    const fileRef = ref(storage, attachmentUrl);
    
    // Delete the file
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting attachment:', error);
    throw error;
  }
};

/**
 * Delete message
 * 
 * @param {string} chatId - Chat ID
 * @param {string} messageId - Message ID
 * @returns {Promise<void>}
 */
export const deleteMessage = async (chatId, messageId) => {
  try {
    // Soft delete the message
    const messageRef = doc(db, `chats/${chatId}/messages/${messageId}`);
    await updateDoc(messageRef, {
      isDeleted: true,
      text: 'This message has been deleted',
      attachments: [],
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};
