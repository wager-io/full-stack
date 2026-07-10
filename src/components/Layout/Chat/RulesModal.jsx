import React from 'react';
import { FaTimes } from 'react-icons/fa';

export default function RulesModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a2c38] rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Chat Rules & Guidelines</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Be respectful to other users. Harassment, hate speech, and discrimination will not be tolerated.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Do not spam the chat with repeated messages or excessive emojis.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>No advertising or promoting other websites, services, or products.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Do not share personal information, including contact details or payment information.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Keep discussions appropriate. Explicit or adult content is not allowed.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>No impersonation of other users, staff, or public figures.</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>English is the primary language for this chat. Please use English to ensure everyone can understand.</span>
            </li>
          </ul>
          
          <p className="mt-4 text-gray-400 text-sm">
            Violation of these rules may result in temporary or permanent restriction from the chat. Our moderators have the final say in all matters.
          </p>
        </div>
        
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}