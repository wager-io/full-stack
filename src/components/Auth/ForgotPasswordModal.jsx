import { useState } from 'react';
import './ForgotPasswordModal.css';
import OTPInputModal from './OTPInputModal';
import { toast } from 'sonner';
import api from '../../utils/api';

function ForgotPasswordModal({ onClose, onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forget', { email });
      
      if (response.data.success) {
        toast.success(response.data.message || 'OTP sent successfully!');
        setShowOTPModal(true);
      } else {
        toast.error(response.data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-modal-overlay">
      <div className="forgot-modal-container">
        <button 
          onClick={onClose}
          className="forgot-modal-close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="forgot-modal-close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="forgot-modal-header">
          Forgot Password
        </div>
        <div className="forgot-modal-body">
            <form onSubmit={handleSubmit}>
              <div className="forgot-modal-field">
                <label className="forgot-modal-label">
                  Enter your email address
                </label>
                <input
                  type="email"
                  className="forgot-modal-input"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="forgot-modal-actions">
                <button
                  type="submit"
                  className="forgot-modal-submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </form>
        </div>
      </div>
      {showOTPModal && (
        <OTPInputModal 
          onClose={() => {
            setShowOTPModal(false);
            onClose();
          }}
          email={email}
          onNavigateToLogin={onNavigateToLogin}
        />
      )}
    </div>
  );
}

export default ForgotPasswordModal;