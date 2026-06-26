import { useState } from 'react'
import './index.css'
import { Header, SideMenu } from './components/index'
import { Outlet } from 'react-router-dom'

function App() {

  const [sideMenu, setSideMenu] = useState(false);

  return (
    <div className='flex flex-row w-full overflow-y-hidden min-h-dvh overflow-x-hidden '>
      <SideMenu sideMenu={sideMenu} setSideMenu={setSideMenu}/>
      <main className='w-full overflow-hidden'>
        <Header setSideMenu={setSideMenu}/>
        <div className='overflow-auto sm:max-h-[calc(100dvh-61.6px)] max-h-[calc(100dvh-112.8px)] pb-10'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default App
