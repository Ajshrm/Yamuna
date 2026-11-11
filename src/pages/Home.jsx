import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProducts } from '../hooks/useProducts'
import { formatCurrency } from '../utils/currency'

function Home() {
  const { products, loading, error } = useProducts()
  const { user } = useAuth()
  const featuredProducts = products.slice(0, 4)

  return (
    <>
      <section className="hero-section">
        <div className="container hero-content">
          <div>
            <p className="eyebrow">New Arrivals</p>
            <h1>Shop smart. Live better.</h1>
            <p className="hero-copy">
              Discover products for home, tech, lifestyle, and everyday essentials.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="primary-btn">
                Shop Now
              </Link>
              {['seller', 'admin'].includes(user?.role) && (
                <Link to="/admin" className="secondary-btn">
                  Manage Shop
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <h2>Featured products</h2>
          <Link to="/products">View all</Link>
        </div>

        {loading && <p>Loading products...</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {!loading && !error && featuredProducts.length === 0 && <p>No products available yet.</p>}
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <article key={product.id} className="product-card">
              <img src={product.image} alt={product.name} />
              <div className="product-card-body">
                <p className="category-tag">{product.category}</p>
                <h3>{product.name}</h3>
                <div className="price-row">
                  <span>{formatCurrency(product.price)}</span>
                  <Link to={`/products/${product.id}`}>Details</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home
