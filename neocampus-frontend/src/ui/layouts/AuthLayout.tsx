import React from 'react'
import { Outlet } from 'react-router-dom'

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
      <Outlet />
    </div>
  )
}

export default AuthLayout
