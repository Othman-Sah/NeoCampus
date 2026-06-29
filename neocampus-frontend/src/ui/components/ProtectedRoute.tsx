import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/application/stores/authStore'
import { UserRole } from '@/domain/entities/User'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user's role is not authorized, redirect to their default dashboard
    const defaultRedirect = getRoleDefaultRedirect(user.role)
    return <Navigate to={defaultRedirect} replace />
  }

  // Otherwise render the route outlets (child routes)
  return <Outlet />
}

/**
 * Returns the default redirect path for a given user role.
 */
function getRoleDefaultRedirect(_role: UserRole): string {
  return '/dashboard'
}
export default ProtectedRoute
