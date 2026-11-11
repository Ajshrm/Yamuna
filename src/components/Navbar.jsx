import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../context/CartContext'

function Navbar() {
  const { itemCount } = useCart()
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          Yamuna
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/products">Shop</Link>
          {!isLoading && user && <Link to="/orders">My Orders</Link>}
          {!isLoading && ['seller', 'admin'].includes(user?.role) && (
            <>
              <Link to="/admin">Seller Dashboard</Link>
              <Link to="/admin#orders">Orders</Link>
            </>
          )}
          <Link to="/cart" className="cart-link">
            Cart <span>{itemCount}</span>
          </Link>
          {!isLoading && (user
            ? <button type="button" className="nav-logout" onClick={() => { logout(); navigate('/') }}>Logout</button>
            : <Link to="/login">Login</Link>)}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
