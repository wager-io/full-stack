import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa'

export default function NotFound() {
  // Add styles using useEffect
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style')
    
    // Add the CSS content
    styleEl.textContent = `
      @keyframes float {
        0% {
          transform: translateY(0) translateX(0)
        }
        25% {
          transform: translateY(-20px) translateX(10px)
        }
        50% {
          transform: translateY(0) translateX(20px)
        }
        75% {
          transform: translateY(20px) translateX(10px)
        }
        100% {
          transform: translateY(0) translateX(0)
        }
      }
      
      .floating-element {
        position: absolute
        animation-name: float
        animation-timing-function: ease-in-out
        animation-iteration-count: infinite
      }
    `
    
    // Append to head
    document.head.appendChild(styleEl)
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(styleEl)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a1a27] text-white p-4">
      <div className="max-w-md w-full bg-[#071824] rounded-2xl p-8 shadow-lg">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-600 bg-opacity-20 rounded-full p-5">
            <FaExclamationTriangle className="text-yellow-500 text-5xl" />
          </div>
        </div>
        
        {/* Error Code */}
        <h1 className="text-6xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          404
        </h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-center mb-6">
          Page Not Found
        </h2>
        
        <p className="text-gray-400 text-center mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <FaHome className="text-lg" />
            Go Home
          </Link>
          
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-lg" />
            Go Back
          </button>
        </div>
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="floating-element rounded-full bg-blue-500 opacity-10"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}
