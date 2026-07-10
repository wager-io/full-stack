import React from 'react';

function Step2Account({ 
  formData, 
  handleChange, 
  showPassword, 
  setShowPassword, 
  showConfirmPassword, 
  setShowConfirmPassword,
  passwordStrength,
  getStrengthColor,
  getStrengthTextColor,
  showReferralField,
  setShowReferralField
}) {
  return (
    <div className="py-2">
      <h3 className="text-white text-lg font-medium mb-4">Create Your Account</h3>
      
      {/* Username Field */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Username
        </label>
        <input
          type="text"
          name="username"
          className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          placeholder="Choose a username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>

      {/* Email Field */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      {/* Password Field */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Password strength indicator */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex w-full h-1 bg-gray-700 rounded-full overflow-hidden">
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

      {/* Confirm Password Field */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Referral Code Field - Collapsible */}
      <div className="mb-4">
        <div 
          className="flex items-center cursor-pointer text-gray-300 hover:text-white mb-2"
          onClick={() => setShowReferralField(!showReferralField)}
        >
          <span className="text-sm font-medium">Have a referral code?</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ml-2 transition-transform ${showReferralField ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {showReferralField && (
          <div className="transition-all duration-300 ease-in-out">
            <input
              type="text"
              name="referralCode"
              className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="Enter referral code (optional)"
              value={formData.referralCode}
              onChange={handleChange}
            />
            {formData.referralCode && (
              <p className="text-green-500 text-xs mt-1">
                Referral code applied!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Step2Account;