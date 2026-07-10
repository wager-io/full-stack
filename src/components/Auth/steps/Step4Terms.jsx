import React from 'react';

function Step4Terms({ formData, handleChange }) {
  return (
    <div className="py-2">
      <h3 className="text-white text-lg font-medium mb-4">Terms and Conditions</h3>
      
      <div className="mb-6 bg-[#0a1824] p-4 rounded-md max-h-[300px] overflow-y-auto">
        <p className="text-gray-300 text-sm leading-relaxed">
          <strong>Terms of Service Agreement</strong><br /><br />
          
          Welcome to Wager Casino. By registering an account, you agree to be bound by the following terms and conditions:<br /><br />
          
          <strong>1. Eligibility</strong><br />
          You must be at least 18 years of age (or the legal gambling age in your jurisdiction, whichever is higher) to use our services. By registering, you confirm that you meet this requirement.<br /><br />
          
          <strong>2. Account Registration</strong><br />
          You are responsible for maintaining the confidentiality of your account information. You agree to provide accurate and complete information during registration and to update this information to keep it current.<br /><br />
          
          <strong>3. Responsible Gambling</strong><br />
          We promote responsible gambling and provide tools to help you manage your gambling activity. You can set deposit limits, time limits, and self-exclusion periods through your account settings.<br /><br />
          
          <strong>4. Privacy Policy</strong><br />
          Your personal information will be collected, processed, and stored in accordance with our Privacy Policy, which is incorporated into these terms by reference.<br /><br />
          
          <strong>5. Prohibited Activities</strong><br />
          You agree not to use our services for any illegal or unauthorized purpose, including money laundering, fraud, or any other activity that violates applicable laws.<br /><br />
          
          <strong>6. Termination</strong><br />
          We reserve the right to suspend or terminate your account at our discretion if we suspect violation of these terms or fraudulent activity.<br /><br />
          
          <strong>7. Changes to Terms</strong><br />
          We may modify these terms at any time. Continued use of our services after such changes constitutes your acceptance of the new terms.<br /><br />
          
          <strong>8. Limitation of Liability</strong><br />
          Our services are provided "as is" without warranties of any kind. We shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of our services.<br /><br />
          
          By checking the box below, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
        </p>
      </div>
      
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="agreeToTerms"
          name="agreeToTerms"
          className="w-4 h-4 bg-[#0f212e] border border-gray-700 rounded mr-3"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          required
        />
        <label htmlFor="agreeToTerms" className="text-gray-300 text-sm">
          I agree to the Terms and Conditions and Privacy Policy
        </label>
      </div>
    </div>
  );
}

export default Step4Terms;