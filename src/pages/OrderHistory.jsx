import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../lib/api'
import { formatCurrency } from '../utils/currency'

function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    let active = true
    apiRequest('/api/orders/my', { token })
      .then((data) => {
        if (active) {
          setOrders(data)
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [token])

  if (loading) {
    return <div className="container section-block"><p>Loading orders...</p></div>
  }

  if (error) {
    return <div className="container section-block"><p className="form-error" role="alert">{error}</p></div>
  }

  if (orders.length === 0) {
    return (
      <div className="container section-block empty-state">
        <h2>No orders yet</h2>
        <p>Your placed orders will appear here.</p>
      </div>
    )
  }

  return (
    <div className="container section-block">
      <h2>Order history</h2>

      <div className="order-list">
        {orders.map((order) => (
          <article key={order.id} className="order-card">
            <div className="order-header">
              <strong>Order #{order.id}</strong>
              <span>{new Date(order.date).toLocaleString()}</span>
            </div>

            <p>{order.customer.name}</p>
            <p>{order.customer.email}</p>
            <p>Status: {order.status}</p>

            <ul>
              {order.items.map((item) => (
                <li key={`${order.id}-${item.id}`}>
                  {item.name} x {item.quantity} - {formatCurrency(item.price * item.quantity)}
                </li>
              ))}
            </ul>

            <strong>Total: {formatCurrency(order.total)}</strong>
          </article>
        ))}
      </div>
    </div>
  )
}

export default OrderHistory
