import React from 'react'
import { useTheme } from '../../context/Context'

function Settings() {

  const { isDark } = useTheme();

  return (
    <div className={`${isDark? "text-gray-200" : "text-gray-800"} w-full flex items-center justify-center p-4 text-xl font-semibold nunitoFont`}>
      <span>Currently Unavailable</span>
    </div>
  )
}

export default Settings