import React from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import DevelopmentPage from '@/ui/pages/development/DevelopmentPage'

export const DevelopmentGate: React.FC = () => {
  const location = useLocation()
  
  // Read disabled paths from localStorage
  const disabledPaths: string[] = JSON.parse(localStorage.getItem('dev_disabled_paths') || '[]')
  
  // Check if current path matches any of the disabled paths (either exactly or as a subroute)
  const isDevelopment = disabledPaths.some((disabledPath: string) => {
    if (location.pathname === disabledPath) {
      return true
    }
    
    // Prevent partial matches: /admin/students-something shouldn't match /admin/students
    // But /admin/students/create should match /admin/students
    const formattedDisabled = disabledPath.endsWith('/') ? disabledPath : `${disabledPath}/`
    return location.pathname.startsWith(formattedDisabled)
  })

  if (isDevelopment) {
    return <DevelopmentPage path={location.pathname} />
  }

  return <Outlet />
}

export default DevelopmentGate
