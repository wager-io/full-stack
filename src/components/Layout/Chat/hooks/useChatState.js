import { useState } from 'react';

export function useChatState() {
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isEmojiDropdownOpen, setIsEmojiDropdownOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [userVipLevel, setUserVipLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const maxCharacters = 200;

  return {
    isLanguageDropdownOpen, setIsLanguageDropdownOpen,
    selectedLanguage, setSelectedLanguage,
    isEmojiDropdownOpen, setIsEmojiDropdownOpen,
    isRulesModalOpen, setIsRulesModalOpen,
    chatInput, setChatInput,
    chatMessages, setChatMessages,
    onlineUsers, setOnlineUsers,
    userVipLevel, setUserVipLevel,
    isLoading, setIsLoading,
    maxCharacters
  };
}