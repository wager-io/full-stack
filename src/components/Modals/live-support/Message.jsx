import React, { useState, useEffect } from 'react'
import { IoClose, IoChatboxOutline, IoTicketOutline, IoTimeOutline, IoCheckmarkDoneOutline } from 'react-icons/io5'
import { LuSendHorizontal } from "react-icons/lu";
import { useAuth } from '../../../context/AuthContext';
import io from 'socket.io-client';
import { serverUrl } from '../../../utils/api';

export default function Messages({ setShowChatAdmin, onClose }) {
  const [previousTickets, setPreviousTickets] = useState([])
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [showNewMessageInput, setShowNewMessageInput] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io(serverUrl(), {
        withCredentials: true
      })

      setSocket(newSocket)

      newSocket.on('connect', () => {
        setIsConnected(true)
        newSocket.emit('get_user_tickets', { userId: user.id || user._id })
      })

      newSocket.on('user_tickets', (tickets) => {
        setPreviousTickets(tickets)
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
      })

      return () => {
        newSocket.disconnect()
      }
    }
  }, [user])

  const handleTicketClick = (ticket) => {
    if (typeof setShowChatAdmin === 'function') {
      setShowChatAdmin(true, ticket.id)
    }
  }

  const handleSendNewMessage = () => {
    if (newMessage.trim() && socket && user) {
      const chatId = `chat_${user.id || user._id}_${Date.now()}` 
      socket.emit('send_support_message', {
        chatId,
        senderId: user.id || user._id,
        senderName: user.username || user.name || 'User',
        content: newMessage,
        isAdmin: false
      })
      setShowChatAdmin(true, chatId)
      setNewMessage('')
      setShowNewMessageInput(false)
    }
  }

  const formatTimeAgo = (timestamp) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return 'Just now'
      if (diffInHours < 24) return `${diffInHours}h ago`
      if (diffInHours < 48) return 'Yesterday'
      return date.toLocaleDateString()
    } catch {
      return 'Recently'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500'
      case 'pending': return 'text-yellow-500'
      case 'closed': return 'text-gray-500'
      default: return 'text-blue-500'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'pending': return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      case 'closed': return <IoCheckmarkDoneOutline className="text-gray-500" />
      default: return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
    }
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h2 className="text-lg font-semibold">Support Messages</h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <IoClose size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {!user ? (
          /* Not logged in */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-gray-500">
              <IoChatboxOutline className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Please log in</h3>
              <p className="text-sm">You need to be logged in to access support messages</p>
            </div>
          </div>
        ) : previousTickets.length === 0 ? (
          /* User logged in but no previous tickets */
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center text-gray-500 mb-8">
              <IoChatboxOutline className="text-4xl text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No message content</h3>
              <p className="text-sm text-gray-400">Start a conversation with our support team</p>
            </div>
            
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 px-6 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
              onClick={() => setShowChatAdmin(true)}
            >
              <span>Send us a message</span>
              <LuSendHorizontal />
            </button>
          </div>
        ) : (
          /* User has previous tickets */
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">Your Support Tickets</h3>
                <button
                  className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  onClick={() => setShowNewMessageInput(true)}
                >
                  <LuSendHorizontal size={16} />
                  New Message
                </button>
              </div>
            </div>

            {/* New Message Input */}
            {showNewMessageInput && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800">Start a new support ticket</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendNewMessage()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendNewMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <LuSendHorizontal size={16} />
                      Send
                    </button>
                    <button
                      onClick={() => {
                        setShowNewMessageInput(false)
                        setNewMessage('')
                      }}
                      className="bg-gray-300 text-gray-700 hover:bg-gray-400 px-3 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {previousTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket)}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <IoTicketOutline className="text-white" size={20} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-800 truncate">
                          Support Request #{ticket.id.slice(-8)}
                        </h4>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(ticket.lastMessageTime)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {ticket.lastMessage || 'No messages yet'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium capitalize ${getStatusColor(ticket.status)}`}>
                          {ticket.status || 'Active'}
                        </span>
                        {ticket.unreadCount > 0 && (
                          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                            {ticket.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
