import { useEffect, useRef } from 'react';
import SocketService from '../../../../services/socketService';
import { serverUrl } from "../../../../utils/api";

export function useChatConnection({ setChatMessages, setOnlineUsers, scrollToBottom }) {
  // Use a ref to track if we're already connected
  const isConnectedRef = useRef(false);

  useEffect(() => {
    // Only connect if not already connected
    if (!isConnectedRef.current) {
      console.log("Connecting to chat server...");
      
      // Connect to the backend socket server
      SocketService.connect(serverUrl());
      isConnectedRef.current = true;
      
      // Load previous messages
      SocketService.onMessage('load_previous_messages', (messages) => {
        console.log("Received previous messages:", messages.length);
        setChatMessages(messages);
        setTimeout(scrollToBottom, 100);
      });

      // Listen for incoming messages
      SocketService.onMessage('receive_message', (message) => {
        console.log("Received new message:", message);
        setChatMessages((prevMessages) => [...prevMessages, message]);
        setTimeout(scrollToBottom, 100);
      });

      // Listen for active user count
      SocketService.onMessage('active_users', (count) => {
        console.log("Active users:", count);
        setOnlineUsers(count);
      });
    }

    // Cleanup on component unmount - NOT on every render
    return () => {
      console.log("Disconnecting from chat server...");
      SocketService.disconnect();
      isConnectedRef.current = false;
    };
  }, []); // Empty dependency array - only run on mount and unmount
}