import React from 'react';

function Step1Language({ formData, handleChange }) {
  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ru', name: 'Русский' }
  ];

  return (
    <div className="py-2">
      <h3 className="text-white text-lg font-medium mb-4">Select Your Language</h3>
      
      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Language
        </label>
        <select
          name="language"
          className="w-full p-3 bg-[#0f212e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          value={formData.language}
          onChange={handleChange}
          required
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.name}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Step1Language;