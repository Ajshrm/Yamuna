import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { formatCurrency } from '../utils/currency'

function ProductList() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const { products, loading, error } = useProducts()
  const categories = ['All', ...new Set(products.map((product) => product.category))]

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [products, search, selectedCategory])

  return (
    <div className="container section-block">
      <div className="section-heading product-header">
        <h2>Products</h2>
        <span>{filteredProducts.length} items</span>
      </div>

      <div className="catalog-controls">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products"
        />

        <div className="category-pills" aria-label="Category filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!loading && !error && filteredProducts.length === 0 && <p>No products found.</p>}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <article key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <div className="product-card-body">
              <p className="category-tag">{product.category}</p>
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="price-row">
                <span>{formatCurrency(product.price)}</span>
                <Link to={`/products/${product.id}`}>View</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ProductList
