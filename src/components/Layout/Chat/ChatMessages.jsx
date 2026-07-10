import React, { useEffect, useRef } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import MessageCard from './MessageCard';

export default function ChatMessages({ chatMessages, chatContainerRef, user }) {
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div
      ref={chatContainerRef}
      className="absolute inset-0 overflow-y-auto p-4 space-y-4 pb-6"
      style={{ maxHeight: '100%' }}
    >
      {chatMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <FaInfoCircle className="w-10 h-10 mb-2" />
          <p>No messages yet. Be the first to say hello!</p>
        </div>
      ) : (
        chatMessages.map((message, index) => (
          <MessageCard 
            key={index}
            message={message}
            isCurrentUser={message.username === user?.username}
          />
        ))
      )}
    </div>
  );
}