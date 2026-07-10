import { useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AuthContext } from '../../context/AuthContext';
import { register as registerAPI } from '../../services/authService';
import SocialLogin from './SocialLogin';
import { useLocation } from 'react-router-dom';

// Import step components
import Step1Language from './steps/Step1Language';
import Step2Account from './steps/Step2Account';
import Step3Personal from './steps/Step3Personal';
import Step4Terms from './steps/Step4Terms';

function RegisterForm({ onClose }) {
  // Form data state
  const [formData, setFormData] = useState({
    language: 'English',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    country: '',
    state: '',
    dateOfBirth: '',
    address: '',
    city: '',
    postalCode: '',
    referralCode: '',
    campaignCode: '',
    agreeToTerms: false
  });

  // UI state
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showReferralField, setShowReferralField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: 'Too weak'
  });

  // Context and location
  const { register } = useContext(AuthContext);
  const location = useLocation();
  
  // Total number of steps
  const totalSteps = 4;

  // Extract referral code and campaign code from URL if present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const refCode = queryParams.get('ref');
    const campaignCode = queryParams.get('campaign');
    
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
      setShowReferralField(true);
    }
    
    if (campaignCode) {
      setFormData(prev => ({ ...prev, campaignCode: campaignCode }));
    }
  }, [location]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Check password strength when password changes
    if (name === 'password') {
      checkPasswordStrength(value);
    }
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

  // Navigate to next step
  const nextStep = () => {
    if (step === 1) {
      if (!formData.language) {
        toast.error('Please select a language');
        return;
      }
    } else if (step === 2) {
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (passwordStrength.score < 3) {
        toast.error('Please use a stronger password');
        return;
      }
    } else if (step === 3) {
      if (!formData.firstName || !formData.lastName || !formData.country || !formData.state || !formData.dateOfBirth) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    setStep(step + 1);
  };

  
  const prevStep = () => {
    setStep(step - 1);
  };

  // Handle form submission (only on the last step)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      toast.error('You must agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const { user, token } = await registerAPI(formData);
      register(user, token);
      toast.success('Registration successful!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render current step component
  const renderStepComponent = () => {
    switch (step) {
      case 1:
        return <Step1Language formData={formData} handleChange={handleChange} />;
      case 2:
        return (
          <Step2Account 
            formData={formData} 
            handleChange={handleChange}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            passwordStrength={passwordStrength}
            getStrengthColor={getStrengthColor}
            getStrengthTextColor={getStrengthTextColor}
            showReferralField={showReferralField}
            setShowReferralField={setShowReferralField}
          />
        );
      case 3:
        return <Step3Personal formData={formData} handleChange={handleChange} />;
      case 4:
        return <Step4Terms formData={formData} handleChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Progress Bar */}
        <div className="flex w-full mb-6">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index}
              className={`h-[3px] flex-1 ${index < step ? 'bg-blue-600' : 'bg-gray-700'} ${index > 0 ? 'ml-1' : ''}`}
            />
          ))}
        </div>
        
        {/* Current Step Component (Scrollable) */}
        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar max-h-[calc(76vh-200px)]"> {/* Adjust max-h as needed */}
          {renderStepComponent()}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              type="button"
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded transition-colors"
              onClick={prevStep}
            >
              Back
            </button>
          )}
          
          {step < totalSteps ? (
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded transition-colors ml-auto"
              onClick={nextStep}
            >
              Proceed
            </button>
          ) : (
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded transition-colors ml-auto"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Register'}
            </button>
          )}
        </div>
      </form>

      {/* Social Login Section */}
      {/* <SocialLogin /> */}
    </>
  );
}

export default RegisterForm;
