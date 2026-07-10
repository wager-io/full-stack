import React, { useState } from 'react';
import SelfAssess from '../../../components/Modals/SA';
import SaComplete from '../../../components/Modals/SaComplete';

export default function SelfAssessment() {
  const [showAssessment, setShowAssessment] = useState(false);
  const [showAssessmentCom, setShowAssessmentCom] = useState(false);

  const handleStart = () => {
    setShowAssessment(true);
  };

  const handleCloseAssessment = () => {
    setShowAssessment(false);
    setShowAssessmentCom(true);
  }

  const handleCloseAssessmentCom = () => {
    setShowAssessmentCom(false);
  }

  return (
    <div className="min-h-screen w-full bg-[#04172d] text-white flex items-center justify-center px-4 py-10">
      {showAssessment ? (
        <SelfAssess onClose={handleCloseAssessment} /> ): showAssessmentCom ? (
          <SaComplete handleCloseAssessmentCom={handleCloseAssessmentCom}/>
      ) : (
        <div className="w-full max-w-7xl bg-[#213743] rounded-2xl shadow-2xl p-10 md:p-16 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="bg-[#1a73e8] p-4 rounded-lg mb-6">
           <img src="/self-assessment-en.svg" alt="" />
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Your Gambling Habits
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl">
            Complete the NODSS Self-Assessment, a quick 3-minute quiz with 10 questions, to better understand your current gambling habits.
          </p>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="bg-[#1a73e8] hover:bg-[#1665c1] transition duration-300 text-white font-medium py-3 px-10 rounded-md text-lg"
          >
            Start Self-Assessment
          </button>
        </div>
      )}
    </div>
  );
}
