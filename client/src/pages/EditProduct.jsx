
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    img: '',
    price: '',
    quantity: '',
    stock: '',
    desc: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Fetch current product details
  useEffect(() => {
    let cancelled = false

    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await api.get(`/api/products/${id}`)
        const product = res.data?.product ?? res.data

        if (!product || !product._id) {
          throw new Error('Product data nahi mila.')
        }

        if (cancelled) return

        setForm({
          name: product.name ?? '',
          img: product.img ?? '',
          price: String(product.price ?? ''),
          quantity: String(product.quantity ?? ''),
          stock: String(product.stock ?? ''),
          desc: product.desc ?? '',
        })
      } catch (err) {
        console.error('Fetch product error:', err)

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Product details load nahi ho paaye.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchProduct()

    return () => {
      cancelled = true
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (saving) return

    const price = Number(form.price)
    const stock = Number(form.stock)

    if (!form.name.trim()) {
      setError('Product name required hai.')
      return
    }

    if (!form.img.trim()) {
      setError('Image URL required hai.')
      return
    }

    if (
      form.price.trim() === '' ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError('Valid price enter karo.')
      return
    }

    if (
      form.stock.trim() === '' ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError('Stock zero ya positive whole number hona chahiye.')
      return
    }

    if (!form.quantity.trim()) {
      setError('Quantity required hai, jaise 15 Kg ya 1 Litre.')
      return
    }

    setSaving(true)

    try {
      const payload = {
        name: form.name.trim(),
        img: form.img.trim(),
        price,
        quantity: form.quantity.trim(), // Product schema: String
        stock,
        desc: form.desc.trim(),
      }

      const res = await api.patch(`/api/products/${id}`, payload)

      // Do not show success unless the API confirms the update
      const updatedProduct = res.data?.product

      if (
        res.data?.success !== true ||
        !updatedProduct ||
        String(updatedProduct._id) !== String(id)
      ) {
        throw new Error(
          res.data?.message ||
            'Backend ne update confirm nahi kiya. Server response check karo.'
        )
      }

      // Confirm that the returned document contains the submitted values
      const valuesMatch =
        updatedProduct.name === payload.name &&
        updatedProduct.img === payload.img &&
        Number(updatedProduct.price) === payload.price &&
        String(updatedProduct.quantity) === payload.quantity &&
        Number(updatedProduct.stock) === payload.stock &&
        String(updatedProduct.desc ?? '') === payload.desc

      if (!valuesMatch) {
        throw new Error(
          'Server ne purani ya different product details return ki hain. Update route check karna hoga.'
        )
      }

      alert('Product updated successfully!')

      // Open the product listing; it will fetch the current data.
      navigate('/products', { replace: true })
    } catch (err) {
      console.error('Update product error:', err)

      setError(
        err.response?.data?.message ||
          err.message ||
          'Product update nahi hua. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-amber-200 bg-white px-4 py-3 text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200'

  return (
    <div className="min-h-screen bg-amber-50 text-stone-900">
      <Navbar />

      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="mb-8 text-center text-3xl font-extrabold">
          Edit Product
        </h1>

        {loading ? (
          <p className="text-center">Loading product...</p>
        ) : error && !form.name ? (
          <p className="text-center text-red-600" role="alert">
            {error}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-amber-200 bg-white p-6 shadow-md sm:p-8"
          >
            {error && (
              <p
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}

            <div>
              <label htmlFor="name" className="mb-2 block font-semibold">
                Product Name
              </label>
              <input
                id="name"
                className={inputClass}
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="img" className="mb-2 block font-semibold">
                Image URL
              </label>
              <input
                id="img"
                className={inputClass}
                name="img"
                type="text"
                value={form.img}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="mb-2 block font-semibold">
                  Price
                </label>
                <input
                  id="price"
                  className={inputClass}
                  type="number"
                  name="price"
                  min="0"
                  step="any"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="quantity" className="mb-2 block font-semibold">
                  Quantity
                </label>
                <input
                  id="quantity"
                  className={inputClass}
                  type="text"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 15 Kg or 1 Litre"
                  required
                />
              </div>

              <div>
                <label htmlFor="stock" className="mb-2 block font-semibold">
                  Stock
                </label>
                <input
                  id="stock"
                  className={inputClass}
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="desc" className="mb-2 block font-semibold">
                Description
              </label>
              <textarea
                id="desc"
                className={inputClass}
                name="desc"
                rows={4}
                value={form.desc}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving || loading}
                className="flex-1 rounded-lg bg-amber-400 px-5 py-3 font-bold text-stone-900 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Updating...' : 'Update Product'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/products')}
                disabled={saving}
                className="rounded-lg border border-stone-300 px-5 py-3 font-semibold hover:bg-stone-100 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}

export default EditProduct
