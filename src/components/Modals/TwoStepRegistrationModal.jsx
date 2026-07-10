import React, { useState } from 'react';
import {countries} from '../../utils/countries';
import { toast } from 'sonner';

export default function TwoStepRegistrationModal({ isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(1); // Track the current step
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    place: '',
    dateOfBirth: '',
    residentAddress: '',
    city: '',
    postalCode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const isOlderThan18 = (date) => {
    const today = new Date();
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Adjust age if the birth month or day hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate Step 1 fields
      if (!formData.firstName || !formData.lastName || !formData.country || !formData.place || !formData.dateOfBirth) {
        toast.error('Please fill in all required fields.');
        return;
      }

      // Validate age
      if (!isOlderThan18(formData.dateOfBirth)) {
        toast.error('You must be at least 18 years old.');
        return;
      }

      setStep(2); // Move to Step 2
    } else {
      onSubmit(formData); // Submit the form
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000ab] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a2c38] p-6 rounded shadow-lg w-96">
        <h2 className="text-lg text-white font-bold mb-4">
          {step === 1 ? 'Step 1: Personal Details' : 'Step 2: Address Details'}
        </h2>
        {step === 1 && (
          <div className="space-y-4">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="w-full px-4 py-2 border border-gray-500 rounded bg-[#0f212e] text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="w-full px-4 py-2 border border-gray-500 rounded bg-[#0f212e] text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-500 rounded bg-[#0f212e] text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="bg-[#1a2c38] text-gray-300">
                Select Country
              </option>
              {countries.map((country, index) => (
                <option key={index} value={country} className="bg-[#1a2c38] text-gray-300">
                  {country}
                </option>
              ))}
            </select>
            <select
              name="place"
              value={formData.place}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-500 rounded bg-[#0f212e] text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" className="bg-[#1a2c38] text-gray-300">
                Select Place
              </option>
              {countries.map((place, index) => (
                <option key={index} value={place} className="bg-[#1a2c38] text-gray-300">
                  {place}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-500 rounded bg-[#0f212e] text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <input
              type="text"
              name="residentAddress"
              value={formData.residentAddress}
              onChange={handleChange}
              placeholder="Resident Address"
              className="w-full px-4 py-2 border border-gray-500 rounded bg-[#0f212e] text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full px-4 py-2 border border-gray-500 rounded bg-[#0f212e] text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Postal Code"
              className="w-full px-4 py-2 border border-gray-500 rounded bg-[#0f212e] text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div className="flex justify-end space-x-4 mt-4">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-gray-500 text-gray-300 rounded hover:bg-gray-400 hover:text-white"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            {step === 1 ? 'Next' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}