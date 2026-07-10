import React from 'react'
import HiloGameView from './HiloGameView'
import HiloMultiplier from './HiloMultiplier'
import HiloActiveCards from './HiloActiveCards'

export default function HiloGameContent() {
  return (
    <div className='game-content svelte-g3o3q3' style={{"min-height": "419px"}}>
        <div className='wrap svelte-124p9tv' >
            <HiloGameView />
            <HiloMultiplier />
            <HiloActiveCards />
        </div>
    </div>
  )
}
