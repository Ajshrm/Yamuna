import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'

function Cart() {
  const { cart, updateQuantity, removeFromCart, total } = useCart()

  if (cart.length === 0) {
    return (
      <div className="container section-block empty-state">
        <h2>Your cart is empty</h2>
        <Link to="/products" className="primary-btn">
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div className="container section-block cart-layout">
      <div className="cart-list">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} />

            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p>{item.category}</p>
              <p>{formatCurrency(item.price * item.quantity)}</p>
            </div>

            <div className="quantity-controls">
              <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                -
              </button>
              <span>{item.quantity}</span>
              <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                +
              </button>
            </div>

            <button type="button" className="remove-btn" onClick={() => removeFromCart(item.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <aside className="summary-box">
        <h3>Order Summary</h3>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="summary-row total-row">
          <span>Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>

        <Link to="/checkout" className="primary-btn checkout-btn">
          Proceed to Checkout
        </Link>
      </aside>
    </div>
  )
}

export default Cart
