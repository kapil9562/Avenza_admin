import { useState } from 'react'
import './index.css'
import { Header, SideMenu } from './components/index'
import { Outlet } from 'react-router-dom'

function App() {

  return (
    <div className='flex flex-row w-full h-dvh'>
      <SideMenu />
      <main className='lg:w-full w-fit'>
        <Header />
        <Outlet />
      </main>
    </div>
  )
}

export default App
