import React from 'react';
import { HiloGameProvider, useHiloGame } from './context/HiloContext';
import HiloControl from './HiloControl';
import HiloGameContentEl from './HiloGameContent';
import './styles/style.css'

// Main component wrapper with context provider
const HiloGame = () => {
  return (
    <HiloGameProvider>
      <HiloGameContent />
    </HiloGameProvider>
  );
};

// Main content component that uses the context
const HiloGameContent = () => {
  const { screenWidth } = useHiloGame();
  const [currentTab, setCurrentTab] = React.useState(1);

  return (
    <div className='game-layout svelte-1dc4nai'>
      <div className='content-wrapper svelte-52mqyn' style={{"--width":" 370px"}}>
        <div className='page-content' id='main-content'>
            <div className='parent svelte-zd0v12'>
                <div className='ctainer svelte-zd0v12'>
                    <div className='layout-spacing variant-normal svelte-rct8um'>
                      <div className='game-wrapper svelte-1dc4nai'>
                          <div className='game-frame svelte-14sn0xa'>
                            <div className='content svelte-14sn0xa main'>
                                <HiloControl />
                                <HiloGameContentEl />
                            </div>
                          </div>
                      </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HiloGame;
