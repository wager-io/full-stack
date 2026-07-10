import React from 'react'
import Navigators from './Navigators';
import SportId from './SportId';
import { SportProvider } from '../sportContext';


export default function SoccerLayout (){
  return (
    <SportProvider>
      <SoccerContents />
    </SportProvider>
  )
}


 function SoccerContents() {
  return (
    <div className='mt-10'>
      <Navigators />
      <SportId />
    </div>
  )
}
