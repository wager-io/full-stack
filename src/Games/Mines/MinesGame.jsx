import React from 'react'
import { MinesProvider } from './context/MinesContext'
import MinesGameContent from './components/MinesGameContent'
import { Helmet } from 'react-helmet'

const MinesGame = () => {
  return (
    <MinesProvider>
      <Helmet>
        <title>Mines Game | Wager</title>
      </Helmet>
      <MinesGameContent />
    </MinesProvider>
  )
}

export default MinesGame