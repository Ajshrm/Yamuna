import { useProducts } from '../hooks/useProducts'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'

function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { products, loading, error } = useProducts()
  const product = products.find((item) => String(item.id) === id)

  if (loading) {
    return <div className="container section-block"><p>Loading product...</p></div>
  }

  if (error) {
    return <div className="container section-block"><p className="form-error" role="alert">{error}</p></div>
  }

  if (!product) {
    return (
      <div className="container section-block">
        <h2>Product not found</h2>
        <Link to="/products">Back to products</Link>
      </div>
    )
  }

  return (
    <div className="container section-block detail-layout">
      <img src={product.image} alt={product.name} className="detail-image" />

      <div className="detail-info">
        <p className="category-tag">{product.category}</p>
        <h2>{product.name}</h2>
        <p className="price-large">{formatCurrency(product.price)}</p>
        <p>{product.description}</p>

        <div className="detail-actions">
          <button type="button" className="primary-btn" onClick={() => addToCart(product)}>
            Add to Cart
          </button>
          <Link to="/products" className="secondary-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
