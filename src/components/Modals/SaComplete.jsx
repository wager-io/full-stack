import React from 'react'
import { RiShieldKeyholeFill } from 'react-icons/ri';
import { IoCloseSharp } from 'react-icons/io5';
export default function SaComplete({handleCloseAssessmentCom}) {
   return (
     <div className="bg-[#0f1c2ea8] w-full top-0 left-0 z-7897667 min-h-screen fixed flex items-center flex-col justify-center px-4">
        
        <div  className="flex items-center justify-between mb-3 relative">
            <div className="flex items-center justify-between mb-3 relative w-full">
                <RiShieldKeyholeFill size={80}/>
                <h1 className='font-semibold flex items-center justify-between mb-2 relative'>Self Assessment Questionnaire</h1>
            </div>
            <div className="flex items-center justify-between mb-3 relative">
                <IoCloseSharp size={35} />
            </div>
        </div>
       <div className="w-full max-w-7xl bg-[#213743] rounded-2xl shadow-2xl p-10 md:p-16 flex flex-col items-center text-center">
         {/* Icon */}
         <div className="bg-[#1a73e8] p-4 rounded-lg mb-6">
         <div className="bg-[#1a73e8] p-4 rounded-lg mb-6">
           <img src="/self-assessment-en.svg" alt="" />
          </div>
         </div>
 
         {/* Title */}
         <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Self Assessment Complete
         </h2>
 
         {/* Description */}
         <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl">
           We appreciate your participation in this self-assessment. Your commitment to responsible gambling is important.
         </p>
 
         {/* Button */}
         <button onClick={handleCloseAssessmentCom} className="bg-[#1a73e8] hover:bg-[#1665c1] transition duration-300 text-white font-medium py-3 px-10 rounded-md text-lg">
           Done
         </button>
       </div>
     </div>
   );
 }
 
