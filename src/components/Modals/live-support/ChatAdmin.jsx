import React, { useState, useEffect, useRef } from 'react'
import { IoClose, IoArrowBack, IoSend } from 'react-icons/io5'
import { BsEmojiSmile } from 'react-icons/bs'
import { HiOutlinePaperClip } from 'react-icons/hi'
import { MdOutlineGifBox } from 'react-icons/md'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { Grid } from '@giphy/react-components'
import EmojiPicker from 'emoji-picker-react'
import { useAuth } from '../../../context/AuthContext'
import io from 'socket.io-client'
import './styles/ChatAdmin.css'
import { serverUrl } from '../../../utils/api';

const gf = new GiphyFetch('dc6zaTOxFJmzC')

export default function ChatAdmin({ onClose, ticketId = null }) {
  const [chatStarted, setChatStarted] = useState(true)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chatId, setChatId] = useState(ticketId)
  const [chatStatus, setChatStatus] = useState('active')
  const [adminInfo, setAdminInfo] = useState({ name: 'Admin Support', avatar: '👨‍💼' })
  const messagesEndRef = useRef(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (user) {
      const newSocket = io(serverUrl(), {
        withCredentials: true
      })

      setSocket(newSocket)

      newSocket.on('connect', () => {
        setIsConnected(true)
        const userChatId = ticketId || `chat-${user.id || user._id}`
        setChatId(userChatId)
        
        newSocket.emit('join_support_chat', {
          chatId: userChatId,
          userId: user.id || user._id,
          userName: user.username || user.name
        })
        newSocket.emit('get_chat_messages', { chatId: userChatId })
        newSocket.emit('get_chat_status', { chatId: userChatId })
      })

      newSocket.on('chat_messages', (data) => {
        const currentChatId = ticketId || `chat-${user.id || user._id}`
        if (data.chatId === currentChatId) {
          setMessages(data.messages)
        }
      })

      newSocket.on('new_support_message', (newMessage) => {
        const currentChatId = ticketId || `chat-${user.id || user._id}`
        if (newMessage.chatId === currentChatId) {
          setMessages(prev => [...prev, newMessage])
        }
      })

      newSocket.on('chat_status_response', (data) => {
        setChatStatus(data.status || 'active')
      })

      newSocket.on('chat_status_updated', (data) => {
        const currentChatId = ticketId || `chat-${user.id || user._id}`
        if (data.chatId === currentChatId) {
          setChatStatus(data.status)
        }
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
        console.log('Disconnected from chat server')
      })

      return () => {
        newSocket.disconnect()
      }
    }
  }, [user, ticketId])

  const handleSend = () => {
    if (message.trim() && socket && chatId && user) {
      socket.emit('send_support_message', {
        chatId,
        senderId: user.id || user._id,
        senderName: user.username || user.name,
        content: message,
        isAdmin: false
      })
      setMessage('')
      setShowEmojiPicker(false)
      setShowGifPicker(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return timestamp
    }
  }

  const getChatStatusColor = () => {
    switch (chatStatus) {
      case 'active': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'closed': return 'text-red-400'
      default: return 'text-blue-400'
    }
  }

  const getChatStatusText = () => {
    switch (chatStatus) {
      case 'active': return 'Active Chat'
      case 'pending': return 'Pending Response'
      case 'closed': return 'Chat Closed'
      default: return 'Support Chat'
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
      {chatStarted && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <IoArrowBack size={20} />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                <span className="text-lg">{adminInfo.avatar}</span>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{getChatStatusText()}</h3>
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm opacity-90">
                    {isConnected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-3xl">👨‍💼</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Support Chat! 👋</h3>
                <p className="text-gray-600 text-center max-w-sm">
                  Hi {user?.username || user?.name || 'there'}! How can we help you today?
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex items-start gap-3 ${msg.isAdmin ? 'flex-row' : 'flex-row-reverse'} max-w-[85%] ${msg.isAdmin ? 'mr-auto' : 'ml-auto'}`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">{msg.isAdmin ? '👨‍💼' : (user?.avatar || '👤')}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                        msg.isAdmin 
                          ? 'bg-white border border-gray-200 text-gray-800' 
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      }`}>
                        <div className="text-sm leading-relaxed">{msg.content}</div>
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${msg.isAdmin ? 'text-left' : 'text-right'}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Emoji & GIF Pickers */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 right-4 z-50 rounded-2xl overflow-hidden shadow-2xl">
              <EmojiPicker 
                onEmojiClick={(emoji) => {
                  setMessage(prev => prev + emoji.emoji)
                  setShowEmojiPicker(false)
                }} 
              />
            </div>
          )}

          {showGifPicker && (
            <div className="absolute bottom-20 left-4 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800">Choose a GIF</h4>
                <button 
                  onClick={() => setShowGifPicker(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <IoClose size={16} />
                </button>
              </div>
              <div className="p-2">
                <Grid
                  width={280}
                  columns={2}
                  fetchGifs={(offset) => gf.trending({ offset, limit: 8 })}
                  onGifClick={(gif) => {
                    setMessage(prev => prev + ' ' + gif.images.fixed_height.url)
                    setShowGifPicker(false)
                  }}
                />
              </div>
            </div>
          )}

          {/* Input Area - Only show if chat is not closed */}
          {chatStatus !== 'closed' ? (
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-200 focus-within:border-blue-500 transition-colors">
                <div className="flex gap-1">
                  <button
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker)
                      setShowGifPicker(false)
                    }}
                    title="Add emoji"
                  >
                    <BsEmojiSmile size={18} />
                  </button>

                  <button
                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    onClick={() => {
                      setShowGifPicker(!showGifPicker)
                      setShowEmojiPicker(false)
                    }}
                    title="Add GIF"
                  >
                    <MdOutlineGifBox size={18} />
                  </button>

                  <label className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors cursor-pointer" title="Attach file">
                    <HiOutlinePaperClip size={18} />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          console.log('File selected:', file)
                          // TODO: Handle file upload
                        }
                      }}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500"
                  disabled={!isConnected}
                />

                <button 
                  className={`p-2 rounded-full transition-all ${
                    message.trim() && isConnected
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={handleSend}
                  disabled={!message.trim() || !isConnected}
                  title="Send message"
                >
                  <IoSend size={18} />
                </button>
              </div>
            </div>
          ) : (
            /* Chat closed message */
            <div className="p-6 bg-red-50 border-t border-red-200 text-center">
              <div className="text-red-600 mb-2">
                <IoClose size={24} className="mx-auto" />
              </div>
              <h4 className="text-red-800 font-medium mb-1">Chat Closed</h4>
              <p className="text-red-600 text-sm">This conversation has been closed. Please start a new chat for further assistance.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
