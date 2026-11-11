import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function RequireRole({ role, children, allowRoles = [] }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="container section-block"><p>Checking account...</p></div>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (![role, ...allowRoles].includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RequireRole
