import { useState } from 'react'
import './index.css'
import { Header, SideMenu } from './components/index'
import { Outlet } from 'react-router-dom'
import { useTheme } from './context/Context';

function App() {

  const [sideMenu, setSideMenu] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className={`flex flex-row w-full overflow-y-hidden min-h-dvh overflow-x-hidden ${isDark ? "bg-[#0F172A]" : "bg-[#F9F9FF]"}`}>
      <SideMenu sideMenu={sideMenu} setSideMenu={setSideMenu} />
      <main className='w-full overflow-hidden'>
        <Header setSideMenu={setSideMenu} />
        <div className='overflow-auto sm:max-h-[calc(100dvh-61.6px)] max-h-[calc(100dvh-112.8px)] pb-10 '>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default App
