
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

function NewProduct() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    img: '',
    price: '',
    quantity: '',
    desc: '',
    stock: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Existing product POST route currently serves EJS redirects.
      await api.post('/api/products', {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      })

      navigate('/products')
    } catch (err) {
      console.error('Add product error:', err)
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Product add nahi ho paaya. Check your permissions and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fffdf5] px-4 py-10">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-amber-300 shadow-lg">
          <div className="bg-[#f7d14d] px-6 py-5 text-center">
            <h1 className="text-2xl font-bold text-[#4b3832]">
              Add a New Mustard Oil Product
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 sm:p-8">
            {error && (
              <div role="alert" className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="mb-2 block font-semibold text-stone-700">
                Product Name
              </label>
              <input
                id="name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Cold-Pressed Mustard Oil"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="img" className="mb-2 block font-semibold text-stone-700">
                Image URL
              </label>
              <input
                id="img"
                name="img"
                type="url"
                required
                value={form.img}
                onChange={handleChange}
                placeholder="https://example.com/product.jpg"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="mb-2 block font-semibold text-stone-700">
                  Price (₹)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  required
                  value={form.price}
                  onChange={handleChange}
                  placeholder="280"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label htmlFor="quantity" className="mb-2 block font-semibold text-stone-700">
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  required
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="1 L"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="desc" className="mb-2 block font-semibold text-stone-700">
                Description
              </label>
              <textarea
                id="desc"
                name="desc"
                rows={3}
                required
                value={form.desc}
                onChange={handleChange}
                placeholder="Add a short description..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="stock" className="mb-2 block font-semibold text-stone-700">
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                required
                value={form.stock}
                onChange={handleChange}
                placeholder="50"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-[#5d9d4a] px-5 py-3 font-bold text-white hover:bg-green-700 disabled:opacity-60"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>

              <Link
                to="/products"
                className="rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

export default NewProduct
