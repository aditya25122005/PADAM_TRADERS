import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

function Cart() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState(null)
  const [message, setMessage] = useState('')

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart')
      setProducts(Array.isArray(res.data) ? res.data : [])
      setError('')
    } catch (err) {
      console.error('Cart fetch error:', err)
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'Please login first to view your cart.'
          : 'Could not load cart. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const handleRemove = async (productId) => {
    setRemovingId(productId)
    setMessage('')

    try {
      await api.delete(`/api/cart/${productId}`)
      setProducts((current) =>
        current.filter((product) => product._id !== productId)
      )
      setMessage('Product removed from cart successfully.')
    } catch (err) {
      console.error('Remove cart error:', err)
      setMessage('Could not remove product. Please try again.')
    } finally {
      setRemovingId(null)
    }
  }

  const total = products.reduce(
    (sum, product) => sum + (Number(product.price) || 0),
    0
  )

  return (
    <div className="min-h-screen bg-amber-50 text-stone-900">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="mb-8 text-3xl font-extrabold sm:text-4xl">
          Your Shopping Cart
        </h1>

        {loading && (
          <p className="py-10 text-center">Loading your cart...</p>
        )}

        {!loading && error && (
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <p className="text-red-700">{error}</p>
            <Link
              to="/login"
              className="mt-4 inline-block font-semibold text-amber-800 hover:underline"
            >
              Go to Login
            </Link>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-stone-600">
              Explore our products and add something to your cart.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-lg bg-[#281914] px-6 py-3 font-bold text-amber-200 hover:bg-amber-800"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="space-y-4">
              {products.map((product, index) => (
                <article
                  key={`${product._id}-${index}`}
                  className="flex flex-col gap-5 rounded-xl bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="flex h-28 w-full items-center justify-center sm:w-32 sm:shrink-0">
                    {product.img ? (
                      <img
                        src={product.img}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-sm text-stone-400">
                        No image
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <Link
                      to={`/products/${product._id}`}
                      className="text-lg font-bold hover:text-amber-800"
                    >
                      {product.name}
                    </Link>

                    <p className="mt-1 text-sm text-stone-500">
                      {product.quantity}
                    </p>

                    <p className="mt-2 font-bold text-amber-800">
                      ₹{product.price}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemove(product._id)}
                    disabled={removingId === product._id}
                    className="rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {removingId === product._id
                      ? 'Removing...'
                      : 'Remove'}
                  </button>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Cart Total</span>
                <span className="font-extrabold text-amber-800">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              <p className="mt-2 text-sm text-stone-500">
                Delivery charges, if applicable, are not included.
              </p>
            </div>
          </>
        )}

        {message && (
          <p className="mt-4 text-sm text-stone-700" role="status">
            {message}
          </p>
        )}
      </main>
    </div>
  )
}

export default Cart