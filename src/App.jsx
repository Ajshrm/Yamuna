import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import RequireRole from './components/RequireRole'
import Footer from './components/Footer'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import AdminPage from './pages/AdminPage'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Home from './pages/Home'
import Login from './pages/Login'
import OrderHistory from './pages/OrderHistory'
import ProductDetail from './pages/ProductDetail'
import ProductList from './pages/ProductList'
import './App.css'

function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-shell">
            <Navbar />

            <main className="page-container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/checkout"
                  element={<RequireRole role="customer" allowRoles={['seller', 'admin']}><Checkout /></RequireRole>}
                />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/orders"
                  element={<RequireRole role="customer" allowRoles={['seller', 'admin']}><OrderHistory /></RequireRole>}
                />
                <Route
                  path="/admin"
                  element={<RequireRole role="seller" allowRoles={['admin']}><AdminPage /></RequireRole>}
                />
                <Route path="*" element={<Home />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </CartProvider>
  )
}

export default App
