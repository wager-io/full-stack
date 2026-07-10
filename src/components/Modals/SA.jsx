import React, { useState } from 'react';
import { IoCloseSharp } from "react-icons/io5";

const questions = [
  "Have there ever been periods when you needed to gamble with increasing amounts of money or with larger bets than before in order to get the same feeling of excitement?",
  "Have you ever tried to control, cut back, or stop gambling without success?",
  "Do you feel restless or irritable when you try to cut down or stop gambling?",
  "Have you ever gambled to escape from problems or relieve feelings of helplessness, guilt, anxiety, or depression?",
  "After losing money gambling, do you often return another day to try and win it back?",
  "Have you ever lied to conceal the extent of your involvement with gambling?",
  "Have you jeopardized or lost a significant relationship, job, or educational/career opportunity because of gambling?",
  "Have you relied on others to provide money to relieve a desperate financial situation caused by gambling?",
  "Do you spend a lot of time thinking about gambling (e.g., reliving past gambling experiences, planning the next venture)?",
  "Do you feel the need to celebrate good fortune with more gambling?"
];

export default function SelfAssessment({onClose}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAnswer = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }

    if( currentIndex === questions.length - 1) {
      onClose(); // Close the modal when the last question is answered
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="bg-[#0f1c2ea8] w-full top-0 left-0 z-7897667 min-h-screen fixed flex items-center justify-center px-4">
      <div className="bg-[#1A2A3D] text-white w-full max-w-sm rounded-lg shadow-lg p-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Self Assessment Questionnaire</h2>
          <IoCloseSharp className="text-xl cursor-pointer" />
        </div>

        {/* Previous Question */}
        {currentIndex > 0 && (
          <div
            onClick={handlePrevious}
            className="text-sm text-blue-400 mb-2 cursor-pointer"
          >
            &lt; Previous Question
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#2c3e50] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question Number */}
        <div className="text-right text-sm mb-4 text-gray-400">
          {currentIndex + 1}/{questions.length}
        </div>

        {/* Current Question */}
        <div className="text-base mb-6">
          <p>{questions[currentIndex]}</p>
        </div>

        {/* Answer Buttons */}
        <div className="flex gap-4">
          <button
            className="w-full bg-[#2A3B4E] hover:bg-[#3a4f66] text-white py-2 rounded-md "
            onClick={handleAnswer}
          >
            Yes
          </button>
          <button
            className="w-full bg-[#2A3B4E] hover:bg-[#3a4f66] text-white py-2 rounded-md"
            onClick={handleAnswer}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}