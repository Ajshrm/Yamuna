import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../context/CartContext'
import { apiRequest } from '../lib/api'
import { formatCurrency } from '../utils/currency'

function Checkout() {
  const { cart, total, clearCart } = useCart()
  const { token, user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    address: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await apiRequest('/api/orders', {
        method: 'POST',
        token,
        body: {
          ...form,
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
      })
      clearCart()
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0 && !submitted) {
    return (
      <div className="container section-block empty-state">
        <h2>Your cart is empty</h2>
        <Link to="/products" className="primary-btn">
          Continue shopping
        </Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="container section-block empty-state">
        <h2>Order placed successfully!</h2>
        <p>Your order has been saved in the Order History page.</p>
        <Link to="/orders" className="primary-btn">
          View order history
        </Link>
      </div>
    )
  }

  return (
    <div className="container section-block checkout-layout">
      <form onSubmit={handleSubmit} className="checkout-form">
        <h2>Checkout</h2>
        {error && <p className="form-error" role="alert">{error}</p>}

        <label>
          Full name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Address
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="primary-btn" disabled={submitting}>
          {submitting ? 'Placing order...' : 'Place Order'}
        </button>
      </form>

      <aside className="summary-box">
        <h3>Cart Summary</h3>
        {cart.map((item) => (
          <div key={item.id} className="summary-row">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}

        <div className="summary-row total-row">
          <span>Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </aside>
    </div>
  )
}

export default Checkout
