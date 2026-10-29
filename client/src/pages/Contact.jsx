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
    <div className="flex min-h-screen flex-col bg-[#fdfbf7]">
      <Navbar />

      {checkingAuth ? (
        <main className="flex flex-1 items-center justify-center p-6 text-stone-600">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-sm border border-amber-200/60">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
            <span className="text-sm font-semibold text-stone-700">Checking authentication...</span>
          </div>
        </main>
      ) : !loggedIn ? (
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-amber-200/60 bg-white p-8 sm:p-10 text-center shadow-xl shadow-amber-900/5">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-800">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Access Restricted
            </p>
            
            <h1 className="mt-1 text-2xl font-bold text-stone-900">
              Login Required
            </h1>

            <p className="mt-2 text-sm text-stone-500 leading-relaxed">
              Please sign in to send a message or inquiry to PADAM Traders.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-amber-700 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-amber-900/10 transition active:scale-[0.99] hover:bg-amber-800"
            >
              Log In to Continue
            </Link>
          </div>
        </main>
      ) : (
        <main className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-10">
          <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-amber-200/60 bg-white shadow-xl shadow-amber-900/5 md:grid-cols-2">
            
            {/* Left Side - Google Map */}
            <div className="relative min-h-[350px] bg-stone-100 md:min-h-[620px]">
              <iframe
                title="Padam Traders location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d698.6213426319399!2d78.64116758794515!3d27.80285429956501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974e03c4cb8b75f%3A0xdcccc9efdb9ce7a5!2sPadam%20Traders!5e1!3m2!1sen!2sin!4v1756663876902!5m2!1sen!2sin"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0 filter grayscale-[20%] contrast-[105%]"
              />
            </div>

            {/* Right Side - Contact Form */}
            <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white">
              <div className="w-full max-w-md">
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                    Contact Us
                  </p>
                  <h1 className="mt-1 text-3xl font-bold text-stone-900">
                    Get in Touch
                  </h1>
                  <p className="mt-1 text-sm text-stone-500">
                    Have questions or feedback? Send us a message and we'll reply promptly.
                  </p>
                </div>

                {success && (
                  <div
                    role="status"
                    className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50/80 p-3.5 text-sm font-medium text-green-800"
                  >
                    <svg className="h-5 w-5 shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {success}
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-sm font-medium text-red-700"
                  >
                    <svg className="h-5 w-5 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700"
                      >
                        Your Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-amber-200/80 bg-stone-50/50 px-4 py-3 text-stone-800 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full rounded-xl border border-amber-200/80 bg-stone-50/50 px-4 py-3 text-stone-800 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contactNo"
                      className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700"
                    >
                      Contact Number
                    </label>
                    <input
                      id="contactNo"
                      name="contactNo"
                      type="tel"
                      required
                      value={form.contactNo}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-amber-200/80 bg-stone-50/50 px-4 py-3 text-stone-800 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700"
                    >
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Write your query or message here..."
                      className="w-full resize-none rounded-xl border border-amber-200/80 bg-stone-50/50 px-4 py-3 text-stone-800 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl bg-amber-700 px-4 py-3.5 font-bold text-white shadow-md shadow-amber-900/10 transition active:scale-[0.99] hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending Message...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </main>
      )}
    </div>
  )
}

export default Contact