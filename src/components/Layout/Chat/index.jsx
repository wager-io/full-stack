import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import SocketService from '../../../services/socketService'; // Import the service correctly
import { serverUrl } from "../../../utils/api";
import { getUserVipProgress } from '../../../services/vipService';
import { toast } from 'sonner';

// Import sub-components
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import RulesModal from './RulesModal';

// Import hooks and utilities
import { useChatState } from './hooks/useChatState';
import { useChatConnection } from './hooks/useChatConnection';

import './chat.css';

export default function Chats({ closeChat }) {
  const { user } = useContext(AuthContext);
  const chatContainerRef = useRef(null);
  const {
    chatInput, setChatInput,
    chatMessages, setChatMessages,
    userVipLevel, setUserVipLevel,
    isRulesModalOpen, setIsRulesModalOpen,
    isLoading, setIsLoading,
    onlineUsers, setOnlineUsers,
    maxCharacters
  } = useChatState();

  // Add these states to your component
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [connectionError, setConnectionError] = useState(null);

  // Fetch user's VIP level when component mounts
  useEffect(() => {
    if (user) {
      fetchVipLevel();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchVipLevel = async () => {
    try {
      const data = await getUserVipProgress();
      // Store only the VIP level
      setUserVipLevel(data.currentTierDetails?.level || 0);
    } catch (error) {
      console.error('Error fetching VIP level:', error);
      setUserVipLevel(0); // Default to level 0 if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const sendMessage = () => {
    if (!user) {
      toast.error('Please log in to send messages');
      return;
    }

    if (chatInput.trim()) {
      try {
        const message = {
          username: user.username,
          content: chatInput,
          vipLevel: userVipLevel,
          timestamp: new Date().toISOString() // Add timestamp
        };
    
        // Send the message to the backend
        SocketService.sendMessage('send_message', message);
        
        // Clear the input field
        setChatInput('');

        // Scroll to the bottom to show the new message
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message. Please try again.");
      }
    }
  };

  // In your useEffect for socket connection
  useEffect(() => {
    const connectToSocket = async () => {
      setConnectionStatus('connecting');
      setConnectionError(null);
      
      try {
        // Connect to the socket server
        await SocketService.connect(serverUrl());
        setConnectionStatus('connected');
        
        // Register event listeners
        SocketService.onMessage('load_previous_messages', (messages) => {
          // console.log("Received previous messages:", messages.length);
          setChatMessages(messages);
          setTimeout(scrollToBottom, 100);
        });
        
        SocketService.onMessage('receive_message', (message) => {
          // console.log("Received new message:", message);
          setChatMessages((prevMessages) => [...prevMessages, message]);
          setTimeout(scrollToBottom, 100);
        });
        
        SocketService.onMessage('active_users', (count) => {
          setOnlineUsers(count);
        });
        
        // Listen for disconnect events
        SocketService.onMessage('disconnect', () => {
          setConnectionStatus('disconnected');
        });
        
      } catch (error) {
        console.error("Socket connection error:", error);
        setConnectionStatus('error');
        setConnectionError(error.message);
      }
    };
    
    connectToSocket();
    
    // Cleanup on unmount
    return () => {
      SocketService.disconnect();
    };
  }, []);

  // Add a reconnect function
  const handleReconnect = () => {
    SocketService.reconnect()
      .then(() => {
        setConnectionStatus('connected');
        setConnectionError(null);
      })
      .catch((error) => {
        setConnectionStatus('error');
        setConnectionError(error.message);
      });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[370px] bg-[#0f212e] text-white shadow-lg z-30 flex flex-col h-full">
      <ChatHeader 
        closeChat={closeChat} 
      />

      {/* Connection status indicator */}
      {connectionStatus !== 'connected' && (
        <div className="bg-gray-800 p-2 text-center">
          {connectionStatus === 'connecting' ? (
            <div className="text-yellow-400">
              <span>Connecting to chat server...</span>
            </div>
          ) : connectionStatus === 'disconnected' ? (
            <div className="text-red-400">
              <span>Disconnected from chat server</span>
              <button 
                onClick={handleReconnect}
                className="ml-2 bg-blue-600 px-2 py-1 rounded text-white text-xs"
              >
                Reconnect
              </button>
            </div>
          ) : (
            <div className="text-red-400">
              <span>Connection error: {connectionError || 'Unknown error'}</span>
              <button 
                onClick={handleReconnect}
                className="ml-2 bg-blue-600 px-2 py-1 rounded text-white text-xs"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-hidden relative">
        <ChatMessages 
          chatMessages={chatMessages}
          chatContainerRef={chatContainerRef}
          user={user}
        />
      </div>

      <ChatInput 
        chatInput={chatInput}
        setChatInput={setChatInput}
        maxCharacters={maxCharacters}
        sendMessage={sendMessage}
        user={user}
        toggleRulesModal={() => setIsRulesModalOpen(true)}
        onlineUsers={onlineUsers}
      />

      {isRulesModalOpen && (
        <RulesModal onClose={() => setIsRulesModalOpen(false)} />
      )}
    </div>
  );
}