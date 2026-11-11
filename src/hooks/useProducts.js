import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    apiRequest('/api/products')
      .then((data) => {
        if (active) {
          setProducts(data)
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
  }, [])

  return { products, loading, error }
}
