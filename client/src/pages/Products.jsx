import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import api from '../services/api'

// Handles both MongoDB _id and API id formats
const getId = (value) => {
  if (value == null) return ''

  if (typeof value === 'object') {
    return String(value._id ?? value.id ?? '')
  }

  return String(value)
}

function Products() {
  const [products, setProducts] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [productsRes, authRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/auth/me'),
      ])

      const loggedInUser = authRes.data.loggedIn
        ? authRes.data.user
        : null

      if (!Array.isArray(productsRes.data)) {
        throw new Error('Products response is not in the correct format.')
      }

      setProducts(productsRes.data)
      setUser(loggedInUser)
    } catch (err) {
      console.error('Products fetch error:', err)

      setError(
        err.message === 'Products response is not in the correct format.'
          ? err.message
          : 'Could not load products. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const isAdmin = user?.role?.toLowerCase() === 'admin'

  const canManageProduct = (product) => {
    if (!user) return false

    // Admin can manage all products
    if (isAdmin) return true

    const currentUserId = getId(user)
    const ownerId = getId(product.author)

    return (
      user.role?.toLowerCase() === 'seller' &&
      user.sellerStatus?.toLowerCase() === 'approved' &&
      currentUserId !== '' &&
      ownerId !== '' &&
      currentUserId === ownerId
    )
  }

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    )

    if (!confirmed) return

    setDeleteError('')

    try {
      await api.delete(`/api/products/${product._id}`)

      setProducts((currentProducts) =>
        currentProducts.filter((item) => item._id !== product._id)
      )
    } catch (err) {
      console.error('Delete product error:', err)

      setDeleteError(
        err.response?.data?.message ||
          'Product could not be deleted. Please try again.'
      )
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 text-stone-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <h1 className="mb-8 text-center text-3xl font-extrabold sm:text-4xl">
          All Products
        </h1>

        {loading && (
          <p className="py-10 text-center text-stone-600">
            Loading products...
          </p>
        )}

        {!loading && error && (
          <p className="py-10 text-center text-red-600" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="py-10 text-center text-stone-600">
            No products available.
          </p>
        )}

        {deleteError && (
          <p className="mb-6 text-center text-red-600" role="alert">
            {deleteError}
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div key={product._id} className="flex flex-col gap-3">
                <ProductCard product={product} />

                {canManageProduct(product) && (
                  <div className="flex gap-3">
                    <Link
                      to={`/products/${product._id}/edit`}
                      className="flex-1 rounded-lg bg-amber-400 px-4 py-2 text-center font-bold text-stone-900 hover:bg-amber-300"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Products