import React, { useState, useEffect, useRef, useContext } from 'react';
import SocketService from '../../services/socketService';
import { AuthContext } from '../../context/AuthContext';
import { serverUrl } from "../../utils/api";
import { getUserVipProgress } from '../../services/vipService';
import { getUserVipTier } from '../../data/vipData';
import { toast } from 'sonner';
import { FaRegSmile, FaInfoCircle, FaGlobe, FaTimes } from 'react-icons/fa';

export default function Chats({ closeChat }) {
  const { user } = useContext(AuthContext);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isEmojiDropdownOpen, setIsEmojiDropdownOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [userVipLevel, setUserVipLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const chatContainerRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const emojiDropdownRef = useRef(null);
  const maxCharacters = 200;

  // Define the languages and emojis arrays
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Russian'];
  const emojis = ['😀', '😂', '😍', '😎', '👍', '🎉', '❤️', '🔥', '👏', '🙏', '🎮', '💰', '🎲', '🎯', '🎪'];

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

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
    setIsEmojiDropdownOpen(false);
  };

  const toggleEmojiDropdown = () => {
    setIsEmojiDropdownOpen(!isEmojiDropdownOpen);
    setIsLanguageDropdownOpen(false);
  };

  const toggleRulesModal = () => {
    setIsRulesModalOpen(!isRulesModalOpen);
  };

  const handleInputChange = (e) => {
    if (e.target.value.length <= maxCharacters) {
      setChatInput(e.target.value);
    }
  };

  const addEmojiToInput = (emoji) => {
    if (chatInput.length + emoji.length <= maxCharacters) {
      setChatInput(chatInput + emoji);
    }
    // Keep emoji dropdown open for multiple selections
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (!user) {
      toast.error('Please log in to send messages');
      return;
    }

    if (chatInput.trim()) {
      const message = {
        username: user.username,
        content: chatInput,
        vipLevel: userVipLevel // Only send the VIP level
      };

      // Send the message to the backend
      SocketService.sendMessage('send_message', message);

      // Clear the input field
      setChatInput('');

      // Scroll to the bottom to show the new message
      setTimeout(scrollToBottom, 100);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
      if (emojiDropdownRef.current && !emojiDropdownRef.current.contains(event.target)) {
        setIsEmojiDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Connect to the backend socket server
    SocketService.connect(serverUrl());

    // Load previous messages
    SocketService.onMessage('load_previous_messages', (messages) => {
      setChatMessages(messages);
      setTimeout(scrollToBottom, 100);
    });

    // Listen for incoming messages
    SocketService.onMessage('receive_message', (message) => {
      setChatMessages((prevMessages) => [...prevMessages, message]);
      setTimeout(scrollToBottom, 100);
    });

    // Listen for active user count
    SocketService.onMessage('active_users', (count) => {
      setOnlineUsers(count);
    });

    // Cleanup on component unmount
    return () => {
      SocketService.disconnect();
    };
  }, []);

  // Render VIP icon based on user's VIP level
  const renderVipIcon = (message) => {
    // Get VIP tier details based on the level
    const vipLevel = message.vipLevel || 0;
    const vipTier = getUserVipTier(vipLevel);
    
    // Render the VIP icon based on the tier
    return (
      <div 
        className="flex items-center justify-center w-8 h-8 rounded-full" 
        style={{ backgroundColor: '#1a2c38' }}
      >
        {typeof vipTier.icon === 'string' ? (
          <svg 
            xmlns="http://www.w3.org/2000/svg"
            fill="none" 
            viewBox="0 0 24 24" 
            className="w-5 h-5"
          >
            <path 
              fill={vipTier.color} 
              d={vipTier.icon}
            />
          </svg>
        ) : (
          <svg 
            fill="none" 
            viewBox={vipTier.icon.viewBox || "0 0 96 96"} 
            className="w-5 h-5"
          >
            <path 
              fill={vipTier.color} 
              d={vipTier.icon.path || "m48 14.595 8.49 15.75a13.68 13.68 0 0 0 9.66 7.08L84 40.635l-12.39 12.9a13.9 13.9 0 0 0-3.9 9.63q-.069.96 0 1.92l2.46 17.76-15.66-7.56a15 15 0 0 0-6.51-1.53 15 15 0 0 0-6.6 1.5l-15.57 7.53 2.46-17.76q.051-.93 0-1.86a13.9 13.9 0 0 0-3.9-9.63L12 40.635l17.64-3.21a13.62 13.62 0 0 0 9.84-7.02zm0-12.54a5.22 5.22 0 0 0-4.59 2.73l-11.4 21.45a5.4 5.4 0 0 1-3.66 2.67l-24 4.32A5.25 5.25 0 0 0 0 38.385a5.13 5.13 0 0 0 1.44 3.6l16.83 17.55a5.16 5.16 0 0 1 1.47 3.6q.024.435 0 .87l-3.27 24a3 3 0 0 0 0 .72 5.19 5.19 0 0 0 5.19 5.22h.18a5.1 5.1 0 0 0 2.16-.6l21.39-10.32a6.4 6.4 0 0 1 2.76-.63 6.2 6.2 0 0 1 2.79.66l21 10.32c.69.377 1.464.573 2.25.57h.21a5.22 5.22 0 0 0 5.19-5.19q.024-.375 0-.75l-3.27-24q-.025-.375 0-.75a5 5 0 0 1 1.47-3.57l16.77-17.7a5.19 5.19 0 0 0-2.82-8.7l-24-4.32a5.22 5.22 0 0 1-3.69-2.76l-11.4-21.45a5.22 5.22 0 0 0-4.65-2.7"}
            />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[370px] bg-[#0f212e] text-white shadow-lg z-30 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 bg-[rgb(15,33,46)] shadow-[0_4px_6px_-1px_#0000007a]">
        {/* Language Dropdown */}
        <div className="relative" ref={languageDropdownRef}>
          <button
            onClick={toggleLanguageDropdown}
            className="flex items-center space-x-2 text-sm font-medium hover:text-blue-500 transition-colors"
          >
            <FaGlobe className="mr-1" />
            <span>{selectedLanguage}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 transform transition-transform ${
                isLanguageDropdownOpen ? 'rotate-180' : 'rotate-0'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isLanguageDropdownOpen && (
            <div className="absolute mt-2 bg-[#1a2c38] border border-gray-700 rounded shadow-lg w-32 z-40 overflow-hidden">
              <ul className="py-1">
                {languages.map((language, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setSelectedLanguage(language);
                      setIsLanguageDropdownOpen(false);
                    }}
                    className="px-4 py-2 text-sm hover:bg-blue-600 cursor-pointer transition-colors"
                  >
                    {language}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="text-lg font-bold">Live Chat</div>

        {/* Close Icon */}
        <button
          onClick={closeChat}
          className="hover:rotate-90 transition-transform duration-300 cursor-pointer"
          aria-label="Close chat"
        >
          <FaTimes className="w-5 h-5 text-white hover:text-red-500" />
        </button>
      </div>

      {/* Chat Content */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar"
      >
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FaInfoCircle className="w-10 h-10 mb-2" />
            <p>No messages yet. Be the first to say hello!</p>
          </div>
        ) : (
          chatMessages.map((message, index) => {
            // Get VIP tier details for the message
            const vipTier = getUserVipTier(message.vipLevel || 0);
            const isCurrentUser = message.username === user?.username;
            
            return (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 
                  ${isCurrentUser 
                    ? 'bg-gradient-to-r from-[#1f3242] to-[#243a4d] border-l-4 border-blue-500' 
                    : 'bg-[#1a2c38] hover:bg-[#213743]'
                  } shadow-md`}
              >
                {/* User VIP Icon with animated glow effect for higher VIP levels */}
                <div className="flex-shrink-0">
                  <div 
                    className={`flex items-center justify-center w-10 h-10 rounded-full 
                      ${message.vipLevel > 3 ? 'animate-pulse-slow' : ''} 
                      ${message.vipLevel > 5 ? 'ring-2 ring-offset-2 ring-offset-[#1a2c38]' : ''}`}
                    style={{ 
                      backgroundColor: '#0f212e',
                      boxShadow: message.vipLevel > 0 ? `0 0 10px ${vipTier.color}40` : 'none',
                      ringColor: vipTier.color
                    }}
                  >
                    <svg 
                      fill="none" 
                      viewBox={vipTier.icon.viewBox || "0 0 96 96"} 
                      className={`w-6 h-6 ${message.vipLevel > 3 ? 'drop-shadow-lg' : ''}`}
                    >
                      <path 
                        fill={vipTier.color} 
                        d={vipTier.icon.path}
                      />
                    </svg>
                  </div>
                </div>
                
                {/* Chat Content with improved styling */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    {/* Username with VIP color */}
                    <p 
                      className="text-sm font-bold truncate mr-2"
                      style={{ 
                        color: vipTier.color || 'white',
                        textShadow: message.vipLevel > 3 ? '0 0 5px rgba(255,255,255,0.3)' : 'none'
                      }}
                    >
                      {message.username}
                    </p>
                    
                    {/* VIP Badge for levels above 0 */}
                    {message.vipLevel > 0 && (
                      <span 
                        className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ 
                          backgroundColor: vipTier.color || '#2F4553',
                          color: ['#FFD700', '#C69C6D'].includes(vipTier.color) ? 'black' : 'white',
                          opacity: 0.9
                        }}
                      >
                        {vipTier.name}
                      </span>
                    )}
                    
                    {/* Timestamp (if available) */}
                    {message.timestamp && (
                      <span className="ml-auto text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  
                  {/* Message content with improved readability */}
                  <div 
                    className={`text-sm rounded-lg py-2 px-3 ${isCurrentUser ? 'bg-[#162736]' : 'bg-[#152331]'}`}
                  >
                    <p className="text-gray-100 break-words leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Chat Input Area - Redesigned for better usability */}
      <div className="border-t border-gray-800 p-3 bg-[#0f212e]">
        {/* Character counter */}
        <div className="flex justify-end mb-1">
          <span className={`text-xs ${chatInput.length > maxCharacters * 0.8 ? 'text-yellow-500' : 'text-gray-400'}`}>
            {chatInput.length}/{maxCharacters}
          </span>
        </div>
        
        <div className="flex items-end space-x-2">
          {/* Emoji Button */}
          <div className="relative" ref={emojiDropdownRef}>
            <button
              onClick={toggleEmojiDropdown}
              className="p-2 rounded-full hover:bg-[#1a2c38] transition-colors"
              aria-label="Add emoji"
            >
              <FaRegSmile className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
            
            {isEmojiDropdownOpen && (
              <div className="absolute bottom-12 left-0 bg-[#1a2c38] border border-gray-700 rounded-lg shadow-lg p-2 z-40">
                <div className="grid grid-cols-5 gap-2">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => addEmojiToInput(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[#2f4553] rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <div className="flex-1 bg-[#1a2c38] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <textarea
              value={chatInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={user ? "Type your message..." : "Please login to chat"}
              className="w-full px-3 py-2 text-sm text-white bg-transparent focus:outline-none resize-none min-h-[40px] max-h-[120px]"
              rows="1"
              disabled={!user}
            />
          </div>
          
          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!user || !chatInput.trim()}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !user || !chatInput.trim() 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            Send
          </button>
        </div>
        
        {/* Chat Rules Link */}
        <div className="mt-2 text-center">
          <button 
            onClick={toggleRulesModal}
            className="text-xs text-gray-400 hover:text-blue-400 transition-colors"
          >
            Chat Rules & Guidelines
          </button>
        </div>
      </div>
    </div>
  );
}
