import React, { useState, useRef, useEffect } from 'react';
import { FaGlobe, FaTimes } from 'react-icons/fa';

export default function ChatHeader({ closeChat }) {
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const languageDropdownRef = useRef(null);
  
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Russian'];

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
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
  );
}