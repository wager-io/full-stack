import React, { useState, useEffect, useRef } from 'react';

export default function VerificationModal({ isOpen, onClose, onVerify, onResendCode }) {
  const [code, setCode] = useState(new Array(6).fill('')); // Array for 6-digit code
  const [error, setError] = useState('');
  const [isResendDisabled, setIsResendDisabled] = useState(true); // Disable resend initially
  const [countdown, setCountdown] = useState(60); // Countdown timer (60 seconds)
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus the first input when modal opens
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0].focus();
      }, 100);
    }
  }, [isOpen]);

    useEffect(() => {
    if (isOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to body to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';
    }
    
    // Cleanup function to restore scrolling when component unmounts or modal closes
    return () => {
      if (isOpen) {
        // Get the scroll position from body top property
        const scrollY = document.body.style.top;
        
        // Remove the fixed position styles
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        
        // Restore the scroll position
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isResendDisabled) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsResendDisabled(false); // Enable the resend button
            return 60; // Reset countdown
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResendDisabled]);

  const handleChange = (value, index) => {
    if (isNaN(value)) return; // Only allow numbers
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Automatically focus the next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      
      // Focus the last input
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleSubmit = () => {
    const verificationCode = code.join('');
    if (verificationCode.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    onVerify(verificationCode);
  };

  const handleResendCode = () => {
    setIsResendDisabled(true); // Disable the resend button
    setCountdown(60); // Reset the countdown
    onResendCode(); // Trigger the resend code function
    setCode(new Array(6).fill('')); // Clear the input fields
    setError(''); // Clear any error messages
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000075] bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] transition-opacity duration-300">
      <div className="relative bg-gradient-to-b from-[#1a2c38] to-[#0f212e] p-8 rounded-lg shadow-2xl w-[420px] border border-[#2f4553] transform transition-all duration-300">

        {/* Header with icon */}
        <div className="flex items-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl text-white font-bold">Verify Your Account</h2>
            <p className="text-gray-400 text-sm">Security verification required</p>
          </div>
        </div>
        
        <p className="text-gray-300 mb-6">
          We've sent a 6-digit verification code to your email. Enter the code below to verify your account.
        </p>
        
        {/* Code input fields */}
        <div className="flex justify-between mb-6">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : null}
              className="w-12 h-14 text-center text-xl font-bold bg-[#0a1824] text-white border border-[#2f4553] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
            />
          ))}
        </div>
        
        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleResendCode}
            disabled={isResendDisabled}
            className={`text-sm flex items-center transition-all duration-200 ${
              isResendDisabled
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-blue-400 hover:text-blue-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            {isResendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
          
          <div className="text-gray-400 text-sm">
            <span className="text-blue-400 cursor-pointer hover:underline">Need help?</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="w-full px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 flex items-center justify-center"
          >
            <span>Verify</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}