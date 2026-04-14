import { useState } from 'react'
import './index.css'
import { Header, SideMenu } from './components/index'
import { Outlet } from 'react-router-dom'

function App() {

  const [sideMenu, setSideMenu] = useState(false);

  return (
    <div className='flex flex-row w-full h-dvh overflow-x-hidden'>
      <SideMenu sideMenu={sideMenu} setSideMenu={setSideMenu}/>
      <main className='w-full'>
        <Header setSideMenu={setSideMenu}/>
        <Outlet />
      </main>
    </div>
  )
}

export default App
