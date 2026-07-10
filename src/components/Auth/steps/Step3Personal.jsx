import React, { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';

function Step3Personal({ formData, handleChange }) {
  // Get all countries
  const countries = Country.getAllCountries();
  
  // States for the selected country
  const [states, setStates] = useState([]);
  // Cities for the selected state
  const [cities, setCities] = useState([]);
  // Date of birth error message
  const [dobError, setDobError] = useState('');

  // Calculate the minimum date (18 years ago from today)
  const calculateMinDate = () => {
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return eighteenYearsAgo.toISOString().split('T')[0];
  };

  // Update states when country changes
  useEffect(() => {
    if (formData.country) {
      const countryData = countries.find(c => c.name === formData.country);
      if (countryData) {
        const countryStates = State.getStatesOfCountry(countryData.isoCode);
        setStates(countryStates);
        
        // Reset state and city when country changes
        if (formData.state) {
          const customEvent = {
            target: {
              name: 'state',
              value: ''
            }
          };
          handleChange(customEvent);
        }
      }
    }
  }, [formData.country]);

  // Update cities when state changes
  useEffect(() => {
    if (formData.state && formData.country) {
      const countryData = countries.find(c => c.name === formData.country);
      const stateData = states.find(s => s.name === formData.state);
      
      if (countryData && stateData) {
        const stateCities = City.getCitiesOfState(
          countryData.isoCode,
          stateData.isoCode
        );
        setCities(stateCities);
        
        // Reset city when state changes
        if (formData.city) {
          const customEvent = {
            target: {
              name: 'city',
              value: ''
            }
          };
          handleChange(customEvent);
        }
      }
    }
  }, [formData.state, formData.country, states]);

  // Custom handler for direct selection
  const handleSelectChange = (e) => {
    handleChange(e);
  };

  // Custom handler for date of birth to validate age
  const handleDateOfBirthChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    
    // Check if birthday has occurred this year
    const hasBirthdayOccurred = 
      today.getMonth() > selectedDate.getMonth() || 
      (today.getMonth() === selectedDate.getMonth() && today.getDate() >= selectedDate.getDate());
    
    const actualAge = hasBirthdayOccurred ? age : age - 1;
    
    if (actualAge < 18) {
      setDobError('You must be at least 18 years old to register');
      // Don't update the form data
    } else {
      setDobError('');
      // Update the form data
      handleChange(e);
    }
  };

  return (
    <div className="py-2">
      <h3 className="text-white text-lg font-medium mb-4">Personal Information</h3>
      
      {/* First Name Field */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          First Name
        </label>
        <input
          type="text"
          name="firstName"
          className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>

      {/* Last Name Field */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Last Name
        </label>
        <input
          type="text"
          name="lastName"
          className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      {/* Country Field */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Country
        </label>
        <select
          name="country"
          className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          value={formData.country}
          onChange={handleSelectChange}
          required
        >
          <option value="">Select your country</option>
          {countries.map(country => (
            <option key={country.isoCode} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* State Field */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          State/Province
        </label>
        <select
          name="state"
          className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          value={formData.state || ''}
          onChange={handleSelectChange}
          required
          disabled={!formData.country}
        >
          <option value="">Select your state</option>
          {states.map(state => (
            <option key={state.isoCode} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>
        {!formData.country && (
          <p className="text-yellow-500 text-xs mt-1">Please select a country first</p>
        )}
      </div>

      {/* Date of Birth Field - Improved Design */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Date of Birth <span className="text-gray-400 text-xs">(Must be 18+ years old)</span>
        </label>
        <div className="relative">
          <input
            type="date"
            name="dateOfBirth"
            className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            value={formData.dateOfBirth}
            onChange={handleDateOfBirthChange}
            max={calculateMinDate()} // Set max date to 18 years ago
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        </div>
        {dobError && (
          <p className="text-red-500 text-xs mt-1">{dobError}</p>
        )}
        <p className="text-gray-400 text-xs mt-1">
          We require users to be at least 18 years old to comply with gambling regulations.
        </p>
      </div>

      {/* City Field */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          City
        </label>
        <select
          name="city"
          className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          value={formData.city || ''}
          onChange={handleChange}
          disabled={!formData.state}
        >
          <option value="">Select your city</option>
          {cities.map(city => (
            <option key={city.id || city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
        {!formData.state && (
          <p className="text-yellow-500 text-xs mt-1">Please select a state first</p>
        )}
      </div>

      {/* Address Field */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Address
        </label>
        <input
          type="text"
          name="address"
          className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          placeholder="Enter your address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      {/* Postal Code Field */}
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Postal Code
        </label>
        <input
          type="text"
          name="postalCode"
          className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          placeholder="Enter your postal code"
          value={formData.postalCode}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default Step3Personal;