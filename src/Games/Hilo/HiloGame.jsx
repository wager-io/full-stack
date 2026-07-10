import React from 'react'
import HiloCanvas from './HiloCanvas'
import HiloControls from './HiloControls'
// import BetsTable from './BetsTable'
import { HiloGameProvider } from './HiloContext'

const HiloGame = () => {
  return (
    <HiloGameProvider>
      <HiloGameContent />
    </HiloGameProvider>
  )
}

const HiloGameContent = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-2 pb-20 md:pb-10 md:p-5 text-white font-sans"> 
      <div className="bg-gray-900 bg-opacity-80 rounded-[18px] shadow-lg shadow-gray-900/50 p-0 md:p-5 mb-5">
        <div className="flex flex-col-reverse md:flex-row gap-3">
          <HiloControls />
          <HiloCanvas />
        </div>
      </div>
      {/* <BetsTable /> */}
    </div>
  )
}

export default HiloGame
