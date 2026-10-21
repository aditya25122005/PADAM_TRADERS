
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

function ProductDetails() {
  const { id } = useParams()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartMessage, setCartMessage] = useState('')
  const [addingToCart, setAddingToCart] = useState(false)

  const [reviews, setReviews] = useState([])
  const [reviewLoading, setReviewLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [deletingReviewId, setDeletingReviewId] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      setReviewLoading(true)
      setError('')

      try {
        const [productRes, reviewsRes, userRes] = await Promise.allSettled([
          api.get(`/api/products/${id}`),
          api.get(`/api/products/${id}/reviews`),
          api.get('/api/auth/me'),
        ])

        if (cancelled) return

        if (productRes.status === 'fulfilled') {
          setProduct(productRes.value.data)
        } else {
          setError('Product load nahi ho paaya.')
        }

        if (reviewsRes.status === 'fulfilled') {
          setReviews(
            Array.isArray(reviewsRes.value.data)
              ? reviewsRes.value.data
              : []
          )
        } else {
          console.error('Reviews fetch error:', reviewsRes.reason)
          setReviewMessage('Reviews load nahi ho paaye.')
        }

        if (userRes.status === 'fulfilled' && userRes.value.data.loggedIn) {
          setCurrentUser(userRes.value.data.user)
        }
      } catch (err) {
        console.error(err)
        if (!cancelled) setError('Data load nahi ho paaya.')
      } finally {
        if (!cancelled) {
          setLoading(false)
          setReviewLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [id])

  const handleAddToCart = async () => {
    setAddingToCart(true)
    setCartMessage('')

    try {
      await api.post(`/api/cart/${id}`)
      setCartMessage('Product cart mein successfully add ho gaya!')
    } catch (err) {
      console.error('Add to cart error:', err)

      if (err.response?.status === 401 || err.response?.status === 403) {
        setCartMessage('Cart mein add karne ke liye pehle login karo.')
      } else {
        setCartMessage(
          err.response?.data?.message ||
            'Product cart mein add nahi hua. Login check karo.'
        )
      }
    } finally {
      setAddingToCart(false)
    }
  }

  const handleSubmitReview = async (event) => {
    event.preventDefault()
    setSubmittingReview(true)
    setReviewMessage('')

    try {
      const res = await api.post(`/api/products/${id}/reviews`, {
        rating,
        comment,
      })

      setReviews((previous) => [res.data, ...previous])
      setComment('')
      setRating(5)
      setReviewMessage('Review successfully submit ho gaya!')
    } catch (err) {
      console.error('Review submit error:', err)

      if (err.response?.status === 401 || err.response?.status === 403) {
        setReviewMessage('Review dene ke liye pehle login karo.')
      } else {
        setReviewMessage(
          err.response?.data?.message || 'Review submit nahi ho paaya.'
        )
      }
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Kya tum ye review delete karna chahte ho?')) return

    setDeletingReviewId(reviewId)
    setReviewMessage('')

    try {
      await api.delete(`/api/products/${id}/reviews/${reviewId}`)

      setReviews((previous) =>
        previous.filter((review) => review._id !== reviewId)
      )
      setReviewMessage('Review delete ho gaya.')
    } catch (err) {
      console.error('Delete review error:', err)
      setReviewMessage(
        err.response?.data?.message ||
          'Review delete nahi hua. Permission check karo.'
      )
    } finally {
      setDeletingReviewId(null)
    }
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : null

  return (
    <div className="min-h-screen bg-amber-50 text-stone-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-12">
        <Link
          to="/products"
          className="font-semibold text-amber-800 hover:underline"
        >
          ← Back to Products
        </Link>

        {loading && (
          <p className="py-12 text-center">Loading product...</p>
        )}

        {!loading && error && (
          <p className="py-12 text-center text-red-700">{error}</p>
        )}

        {!loading && !error && product && (
          <>
            <div className="mt-8 grid gap-10 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
              <div className="flex min-h-72 items-center justify-center rounded-xl p-4">
                {product.img ? (
                  <img
                    src={product.img}
                    alt={product.name}
                    className="max-h-96 w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <p className="text-stone-400">No image available</p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
                  PADAM Traders
                </p>

                <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                  {product.name}
                </h1>

                <p className="mt-4 text-2xl font-bold text-amber-800">
                  ₹{product.price}
                </p>

                {product.quantity && (
                  <p className="mt-4 text-stone-600">
                    <strong>Quantity:</strong> {product.quantity}
                  </p>
                )}

                <p className="mt-3 text-sm font-medium">
                  {product.stock > 0 ? (
                    <span className="text-green-700">
                      In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </p>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock <= 0}
                  className="mt-6 w-full rounded-lg bg-[#281914] px-5 py-3 font-bold text-amber-200 hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                {cartMessage && (
                  <p className="mt-3 text-sm text-stone-700" role="status">
                    {cartMessage}
                  </p>
                )}

                {product.desc && (
                  <div className="mt-6">
                    <h2 className="text-lg font-bold">Description</h2>
                    <p className="mt-2 whitespace-pre-line leading-7 text-stone-600">
                      {product.desc}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <section className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold">Customer Reviews</h2>

                {averageRating !== null ? (
                  <p className="mt-2 text-stone-600">
                    <span className="font-bold text-amber-700">
                      ★ {averageRating}/5
                    </span>{' '}
                    · {reviews.length} review
                    {reviews.length === 1 ? '' : 's'}
                  </p>
                ) : (
                  <p className="mt-2 text-stone-600">
                    Abhi koi review nahi hai. Pehla review tum do!
                  </p>
                )}
              </div>

              {currentUser ? (
                <form
                  onSubmit={handleSubmitReview}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-bold">Write a Review</h3>

                  <label
                    htmlFor="rating"
                    className="mt-4 block text-sm font-semibold"
                  >
                    Your Rating
                  </label>

                  <div
                    className="mt-2 flex gap-2"
                    role="radiogroup"
                    aria-label="Choose a rating"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={rating === star}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        onClick={() => setRating(star)}
                        className={`text-3xl ${
                          star <= rating ? 'text-amber-400' : 'text-stone-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <label
                    htmlFor="reviewComment"
                    className="mt-5 block text-sm font-semibold"
                  >
                    Comment
                  </label>

                  <textarea
                    id="reviewComment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Apna experience share karo..."
                    className="mt-2 w-full rounded-lg border border-stone-300 p-3 outline-none focus:border-amber-600"
                  />

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="mt-4 rounded-lg bg-[#281914] px-6 py-3 font-bold text-amber-200 hover:bg-amber-800 disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <p className="text-stone-600">
                    Review dene ke liye login karo.
                  </p>
                <Link
                to="/login"
                className="mt-3 inline-block font-semibold text-amber-800 hover:underline"
              >
                Login
              </Link>
                </div>
              )}

              {reviewMessage && (
                <p className="mt-4 text-sm text-stone-700" role="status">
                  {reviewMessage}
                </p>
              )}

              <div className="mt-6 space-y-4">
                {reviewLoading && (
                  <p className="text-stone-600">Loading reviews...</p>
                )}

                {!reviewLoading && reviews.length === 0 && (
                  <p className="rounded-xl bg-white p-5 text-stone-600">
                    No reviews yet.
                  </p>
                )}

                {reviews.map((review) => {
                  const authorId =
                    typeof review.author === 'object'
                      ? review.author?._id
                      : review.author

                  const isAuthor =
                    currentUser &&
                    authorId &&
                    String(authorId) === String(currentUser.id)

                  return (
                    <article
                      key={review._id}
                      className="rounded-xl bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-bold">
                            {review.author?.username || 'Customer'}
                          </p>
                          <p className="mt-1 text-amber-500">
                            {'★'.repeat(
                              Math.min(5, Math.max(0, Number(review.rating) || 0))
                            )}
                            <span className="text-stone-300">
                              {'★'.repeat(
                                5 -
                                  Math.min(
                                    5,
                                    Math.max(0, Number(review.rating) || 0)
                                  )
                              )}
                            </span>
                          </p>
                        </div>

                        {isAuthor && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review._id)}
                            disabled={deletingReviewId === review._id}
                            className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                          >
                            {deletingReviewId === review._id
                              ? 'Deleting...'
                              : 'Delete Review'}
                          </button>
                        )}
                      </div>

                      {review.comment && (
                        <p className="mt-3 whitespace-pre-line text-stone-600">
                          {review.comment}
                        </p>
                      )}

                      {review.createdAt && (
                        <p className="mt-3 text-xs text-stone-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default ProductDetails
