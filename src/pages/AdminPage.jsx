import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency } from '../utils/currency'

const initialForm = {
  name: '',
  category: 'Electronics',
  price: '',
  description: '',
  image: '',
  stock: '0',
}

function OrdersTable({ orders, onComplete, completingOrderId }) {
  if (orders.length === 0) {
    return <p>No orders in this list yet.</p>
  }

  return (
    <div className="table-scroll">
      <table className="admin-orders-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Ship to</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Placed</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>
                <strong>{order.customer.name}</strong>
                <br />
                {order.customer.email}
              </td>
              <td>{order.customer.address}</td>
              <td>
                <ul className="admin-order-items">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.name} × {item.quantity}
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </td>
              <td>{formatCurrency(order.total)}</td>
              <td>
                <span className={`order-status ${order.status === 'Completed' ? 'is-completed' : 'is-new'}`}>
                  {order.status}
                </span>
              </td>
              <td>{new Date(order.date).toLocaleString()}</td>
              <td>
                {order.status !== 'Completed' ? (
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={completingOrderId === order.id}
                    onClick={() => onComplete(order.id)}
                  >
                    {completingOrderId === order.id ? 'Saving...' : 'Complete'}
                  </button>
                ) : <span className="completed-label">Done</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AdminPage() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completingOrderId, setCompletingOrderId] = useState(null)
  const [orderFilter, setOrderFilter] = useState('all')

  useEffect(() => {
    let active = true
    Promise.all([
      apiRequest('/api/products', { token }),
      apiRequest('/api/orders', { token }),
    ])
      .then(([productData, orderData]) => {
        if (active) {
          setProducts(productData)
          setOrders(orderData)
          setError('')
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

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const product = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    }

    try {
      const savedProduct = await apiRequest(
        editingId ? `/api/products/${editingId}` : '/api/products',
        {
          method: editingId ? 'PUT' : 'POST',
          token,
          body: product,
        },
      )
      setProducts((current) => (
        editingId
          ? current.map((item) => item.id === editingId ? savedProduct : item)
          : [savedProduct, ...current]
      ))
      setForm(initialForm)
      setEditingId(null)
      setShowProductForm(false)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setShowProductForm(true)
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      description: product.description,
      image: product.image,
      stock: String(product.stock),
    })
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      await apiRequest(`/api/products/${id}`, { method: 'DELETE', token })
      setProducts((current) => current.filter((product) => product.id !== id))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleCompleteOrder = async (id) => {
    setError('')
    setCompletingOrderId(id)
    try {
      const result = await apiRequest(`/api/orders/${id}/complete`, {
        method: 'PATCH',
        token,
      })
      setOrders((current) => current.map((order) => (
        order.id === id ? { ...order, status: result.status } : order
      )))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setCompletingOrderId(null)
    }
  }

  const pendingOrders = orders.filter((order) => order.status !== 'Completed')
  const completedOrders = orders.filter((order) => order.status === 'Completed')
  const visibleOrders = orderFilter === 'new'
    ? pendingOrders
    : orderFilter === 'completed'
      ? completedOrders
      : orders

  return (
    <div className="container section-block">
      <h2>Seller dashboard</h2>
      <nav className="admin-section-links" aria-label="Admin sections">
        <a href="#products">Products</a>
        <a href="#orders">Orders</a>
      </nav>

      {error && <p className="form-error" role="alert">{error}</p>}
      {loading && <p>Loading admin data...</p>}

      <section
        id="products"
        className={`admin-section admin-products${showProductForm ? ' admin-layout' : ''}`}
      >
        <div className="admin-products-heading">
          <h2>Products</h2>
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setEditingId(null)
              setForm(initialForm)
              setShowProductForm(true)
            }}
          >
            + Add New Product
          </button>
        </div>

        {showProductForm && (
          <form onSubmit={handleSubmit} className="admin-form">
          <h2>{editingId ? 'Edit product' : 'New product details'}</h2>

          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Category
            <select name="category" value={form.category} onChange={handleChange}>
              <option>Electronics</option>
              <option>Furniture</option>
              <option>Fashion</option>
              <option>Home</option>
              <option>Accessories</option>
            </select>
          </label>

          <label>
            Price (₹)
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Stock
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} required />
          </label>

          <label>
            Image URL
            <input name="image" value={form.image} onChange={handleChange} />
          </label>

          <button type="submit" className="primary-btn">
            {editingId ? 'Save changes' : 'Create product'}
          </button>
          {editingId && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setEditingId(null)
                setForm(initialForm)
                setShowProductForm(false)
              }}
            >
              Cancel editing
            </button>
          )}
          {!editingId && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => { setForm(initialForm); setShowProductForm(false) }}
            >
              Cancel
            </button>
          )}
          </form>
        )}

        <div className="admin-product-list">
          {products.length === 0 && <p>No products yet. Add your first product above.</p>}
          {products.map((product) => (
            <div key={product.id} className="admin-item">
              <div>
                <strong>{product.name}</strong>
                <p>{product.category} · {formatCurrency(product.price)} · Stock: {product.stock}</p>
              </div>
              <div className="admin-actions">
                <button type="button" className="secondary-btn" onClick={() => handleEdit(product)}>
                  Edit
                </button>
                <button type="button" className="remove-btn" onClick={() => handleDelete(product.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="orders" className="admin-section">
        <div className="section-heading">
          <div>
            <h2>Order management</h2>
            <p>Review customer orders and track fulfillment.</p>
          </div>
        </div>
        <div className="order-stats">
          <div className="order-stat-card">
            <span>All orders</span>
            <strong>{orders.length}</strong>
          </div>
          <div className="order-stat-card">
            <span>New</span>
            <strong>{pendingOrders.length}</strong>
          </div>
          <div className="order-stat-card">
            <span>Completed</span>
            <strong>{completedOrders.length}</strong>
          </div>
        </div>
        <div className="order-filters" role="group" aria-label="Filter orders">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'new', label: 'New Orders', count: pendingOrders.length },
            { id: 'completed', label: 'Completed Orders', count: completedOrders.length },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={orderFilter === filter.id ? 'active' : ''}
              aria-pressed={orderFilter === filter.id}
              onClick={() => setOrderFilter(filter.id)}
            >
              {filter.label} <span>{filter.count}</span>
            </button>
          ))}
        </div>
        <OrdersTable
          orders={visibleOrders}
          onComplete={handleCompleteOrder}
          completingOrderId={completingOrderId}
        />
      </section>
    </div>
  )
}

export default AdminPage
