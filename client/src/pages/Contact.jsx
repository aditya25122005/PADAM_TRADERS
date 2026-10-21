
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    contactNo: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    api.get('/api/auth/me')
      .then((res) => setLoggedIn(res.data.loggedIn))
      .catch(() => setLoggedIn(false))
      .finally(() => setCheckingAuth(false))
  }, [])

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')

    try {
      const response = await api.post('/contact', form)

      if (response.data.success) {
        setSuccess(response.data.message || 'Message sent successfully!')
        setForm({
          name: '',
          email: '',
          contactNo: '',
          message: '',
        })
      } else {
        setError(response.data.message || 'Could not send your message.')
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Could not send your message. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      {checkingAuth ? (
        <main className="min-h-screen bg-gray-100 px-4 py-20 text-center">
          Checking login status...
        </main>
      ) : !loggedIn ? (
        <main className="min-h-screen bg-gray-100 px-4 py-20 text-center">
          <h1 className="mb-3 text-3xl font-bold text-stone-900">
            Login Required
          </h1>

          <p className="mb-6 text-gray-600">
            Please login to contact PADAM Traders.
          </p>

          <Link
            to="/login"
            className="inline-block rounded-lg bg-amber-500 px-6 py-3 font-bold text-stone-900 hover:bg-amber-400"
          >
            Login
          </Link>
        </main>
      ) : (
        <main className="min-h-screen bg-gray-100 px-4 py-10 sm:py-14">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-xl bg-white shadow-xl md:grid-cols-2">
            <div className="min-h-[350px] md:min-h-[600px]">
              <iframe
                title="Padam Traders location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d698.6213426319399!2d78.64116758794515!3d27.80285429956501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974e03c4cb8b75f%3A0xdcccc9efdb9ce7a5!2sPadam%20Traders!5e1!3m2!1sen!2sin!4v1756663876902!5m2!1sen!2sin"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[350px] w-full md:min-h-[600px]"
              />
            </div>

            <div className="p-6 sm:p-10 lg:p-12">
              <h1 className="mb-3 text-center text-3xl font-bold text-stone-900">
                Get in Touch
              </h1>

              <p className="mb-7 text-center text-gray-500">
                We'd love to hear from you. Send us your questions or inquiries.
              </p>

              {success && (
                <div role="status" className="mb-5 rounded-lg bg-green-100 p-4 text-sm text-green-800">
                  {success}
                </div>
              )}

              {error && (
                <div role="alert" className="mb-5 rounded-lg bg-red-100 p-4 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contactNo" className="mb-2 block font-medium text-gray-700">
                    Contact No.
                  </label>
                  <input
                    id="contactNo"
                    name="contactNo"
                    type="tel"
                    required
                    value={form.contactNo}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-2 block font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={handleChange}
                    className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-amber-500 px-5 py-3 font-bold text-stone-900 hover:bg-amber-400 disabled:opacity-60"
                >
                  {loading ? 'Sending...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </main>
      )}
    </>
  )
}

export default Contact
