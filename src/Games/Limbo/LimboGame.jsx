import React from 'react'
import LimboCanvas from './LimboCanvas'
import LimboControls from './LimboControls'
import BetsTable from './BetsTable'
import "./style.css"
import { LimboGameProvider } from './LimboContext'

const LimboGame = () => {
  return (
    <LimboGameProvider>
      <LimboGameContent />
    </LimboGameProvider>
  )
}

const LimboGameContent = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-2 pb-20 md:pb-10 md:p-5 text-white font-sans"> 
      <div className="bg-gray-900 bg-opacity-80 rounded-[18px] shadow-lg shadow-gray-900/50 p-0 md:p-5 mb-5">
        <div className="flex flex-col-reverse md:flex-row gap-3">
          <LimboControls />
          <LimboCanvas />
        </div>
      </div>
    </div>
  )
}

export default LimboGame