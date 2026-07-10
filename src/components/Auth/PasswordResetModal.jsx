import { useState } from 'react';
import { toast } from 'sonner';
import './PasswordResetModal.css';
import api from '../../utils/api';

function PasswordResetModal({ onClose, email, onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: 'Too weak'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }

    if (error) setError('');
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = 'Too weak';

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score === 5) message = 'Very strong';
    else if (score === 4) message = 'Strong';
    else if (score === 3) message = 'Medium';
    else if (score === 2) message = 'Weak';
    else message = 'Too weak';

    setPasswordStrength({ score, message });
  };

  const getStrengthColor = (score) => {
    if (score >= 4) return 'bg-green-500';
    if (score === 3) return 'bg-yellow-500';
    if (score === 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthTextColor = (score) => {
    if (score >= 4) return 'text-green-500';
    if (score === 3) return 'text-yellow-500';
    if (score === 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordStrength.score < 3) {
      setError('Please use a stronger password');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
     
      const response = await api.post(`/auth/change-password/${email}`, {
          password: formData.newPassword 
      });
      
      console.log('Resetting password for email:', response);
      console.log('New password:', formData.newPassword);
      
    if (response.data.success) {
      toast.success('Password reset successfully');
    } else {
      toast.error(response.data.message || 'Failed to reset password. Please try again.');}
     
      if (onNavigateToLogin) {
        onNavigateToLogin();
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.newPassword && formData.confirmPassword;

  return (
    <div className="password-reset-modal-overlay">
      <div className="password-reset-modal-container">
        <button
          onClick={onClose}
          className="password-reset-modal-close"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="password-reset-modal-close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="password-reset-modal-header">
          Reset Password
        </div>

        <div className="password-reset-modal-subtitle">
          Enter your new password
        </div>

        <form onSubmit={handleSubmit} className="password-reset-modal-form">
          <div className="password-reset-field">
            <label className="password-reset-label">New Password</label>
            <div className="password-reset-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                className="password-reset-input"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-reset-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="password-reset-eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>

            {formData.newPassword && (
              <div className="password-strength-indicator">
                <div className="flex w-full h-1 bg-gray-700 rounded-full overflow-hidden mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full ${i < passwordStrength.score ? getStrengthColor(passwordStrength.score) : 'bg-gray-700'}`}
                      style={{ width: '20%' }}
                    />
                  ))}
                </div>
                <p className={`text-xs mt-1 ${getStrengthTextColor(passwordStrength.score)}`}>
                  {passwordStrength.message}
                </p>
              </div>
            )}
          </div>

          <div className="password-reset-field">
            <label className="password-reset-label">Confirm Password</label>
            <div className="password-reset-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="password-reset-input"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-reset-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="password-reset-eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showConfirmPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {error && <div className="password-reset-modal-error">{error}</div>}

          <button
            type="submit"
            className={`password-reset-submit-btn ${isFormValid ? 'active' : ''}`}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordResetModal;
