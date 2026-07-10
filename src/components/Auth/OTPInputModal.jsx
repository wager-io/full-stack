import { useState, useRef, useEffect } from 'react';
import './OTPInputModal.css';
import PasswordResetModal from './PasswordResetModal';
import { toast } from 'sonner';
import api from '../../utils/api';

function OTPInputModal({ onClose, email, onNavigateToLogin }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const inputRefs = useRef([]);
  const isComplete = otp.every(digit => digit !== '');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    const expiryTimer = setTimeout(() => {
      setIsExpired(true);
      toast.error('OTP has expired. Please request a new one.');
    }, 10 * 60 * 1000); 

    return () => clearTimeout(expiryTimer);
  }, []);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }
    
    if (isExpired) {
      toast.error('OTP has expired. Please request a new one.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await api.post(`/auth/verify-otp/${email}`, {
        otpCode: otpString 
      });
      
      if (response.data.success) {
        toast.success('OTP verified successfully!');
        setShowPasswordReset(true);
      } else {
        toast.error(response.data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!showPasswordReset ? (
        <div className="otp-modal-overlay">
          <div className="otp-modal-container">
            <button 
              onClick={onClose}
              className="otp-modal-close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="otp-modal-close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="otp-modal-header">
              OTP Input
            </div>
            <div className="otp-modal-subtitle">
              Enter your one-time password
            </div>
            <form onSubmit={handleSubmit} className="otp-modal-form">
              <div className="otp-inputs-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    className={`otp-input ${otp[index] ? 'active' : ''}`}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>
              <button
                type="submit"
                className={`otp-submit-btn ${isComplete ? 'active' : ''}`}
                disabled={!isComplete || isLoading}
              >
                {isLoading ? 'Verifying...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <PasswordResetModal 
          onClose={onClose}
          email={email}
          onNavigateToLogin={onNavigateToLogin}
        />
      )}
    </>
  );
}

export default OTPInputModal;
