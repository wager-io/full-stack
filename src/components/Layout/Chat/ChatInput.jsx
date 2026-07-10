import React, { useState } from 'react';
import { FiSend, FiInfo, FiUsers } from 'react-icons/fi';
import { BsEmojiSmile } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';

export default function ChatInput({ 
  chatInput, 
  setChatInput, 
  maxCharacters, 
  sendMessage, 
  user, 
  toggleRulesModal,
  onlineUsers = 0 // Add parameter for online users count
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    setChatInput(prevInput => prevInput + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxCharacters) {
      setChatInput(value);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t border-[#1f3242] bg-[#0f212e]">

      
      {/* Character count */}
      <div className="px-3 py-1.5 flex justify-between items-center">
        <div className="text-xs text-gray-400">
          {chatInput.length}/{maxCharacters} characters
        </div>
        
        {!user && (
          <div className="text-xs text-yellow-400">
            Login to chat
          </div>
        )}
      </div>
      
      {/* Input area with emoji picker */}
      <div className="relative px-3 pb-3">
        {/* Emoji picker popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-[60px] right-3 z-10">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              disableAutoFocus={true}
              searchDisabled={true}
              skinTonesDisabled={true}
              width={280}
              height={320}
              previewConfig={{ showPreview: false }}
              theme="dark"
            />
          </div>
        )}
        
        {/* Input field and buttons */}
        <div className="flex items-center bg-[#1a2c38] rounded-lg overflow-hidden border border-[#2f4553] focus-within:border-blue-500 transition-colors">
          {/* Text input */}
          <textarea
            value={chatInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={user ? "Type your message..." : "Login to chat"}
            disabled={!user}
            className="flex-1 bg-transparent text-white placeholder-gray-500 p-3 outline-none resize-none max-h-[80px] min-h-[44px] text-sm"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#2f4553 #1a2c38' }}
          />
          
          {/* Emoji button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={!user}
            className={`p-2 text-lg ${user ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-600'} transition-colors`}
            title="Add emoji"
          >
            <BsEmojiSmile />
          </button>
          
          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={!user || !chatInput.trim()}
            className={`p-3 ${
              user && chatInput.trim() 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-[#2f4553] text-gray-500 cursor-not-allowed'
            } transition-colors`}
            title="Send message"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
            {/* Active users and rules bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1a2c38]">
        {/* Active users display */}
        <div className="flex items-center text-gray-300 text-xs">
          <FiUsers className="text-blue-400 mr-1.5" />
          <span>{onlineUsers} {onlineUsers === 1 ? 'user' : 'users'} online</span>
        </div>
        
        {/* Rules button */}
        <button
          onClick={toggleRulesModal}
          className="flex items-center text-xs text-gray-300 hover:text-white transition-colors"
        >
          <FiInfo className="mr-1" />
          <span>Chat Rules</span>
        </button>
      </div>
    </div>
  );
}