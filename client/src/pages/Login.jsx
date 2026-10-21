import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../services/api'

function Login() {
  const [form, setForm] = useState({
    username: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.username.trim() || !form.password) {
      setError('Please enter your username and password.')
      return
    }

    try {
      setLoading(true)

      await api.post('/api/auth/login', {
        username: form.username.trim(),
        password: form.password,
      })

      // Login ke baad seedha Products page kholo
      window.location.assign('/products')
    } catch (err) {
      setError(
        err.response?.data?.error || 'Login failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#21140f] px-4 py-10 sm:py-16">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-amber-500/50 bg-[#fffaf0] shadow-2xl md:grid-cols-2">

          <div className="relative flex min-h-64 flex-col justify-end bg-[#382016] p-8 text-white sm:min-h-96 md:min-h-[580px]">
            <img
              src="/images/slide3.jpg"
              alt="PADAM Traders"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

            <div className="relative z-10">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
                Welcome to
              </p>

              <h1 className="text-3xl font-extrabold tracking-wider sm:text-4xl">
                PADAM TRADERS
              </h1>

              <p className="mt-3 text-amber-100">
                Quality you trust, purity you deserve.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 sm:p-10 md:p-12">
            <div className="w-full max-w-sm">
              <p className="text-sm font-bold uppercase tracking-widest text-amber-700">
                Your account
              </p>

              <h2 className="mt-2 text-3xl font-bold text-stone-900">
                Welcome Back
              </h2>

              <p className="mt-2 mb-8 text-sm text-stone-500">
                Login to continue shopping with us.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block font-semibold text-stone-700"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="w-full rounded-lg border border-amber-200 bg-white px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block font-semibold text-stone-700"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-amber-200 bg-white px-4 py-3 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-amber-700 px-4 py-3 font-bold text-white shadow-md transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-stone-200" />
                <span className="text-xs text-stone-400">OR</span>
                <div className="h-px flex-1 bg-stone-200" />
              </div>

              <a
                href="http://localhost:8085/auth/google"
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-3 font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                <span className="text-lg font-bold text-blue-600">G</span>
                Continue with Google
              </a>

              <p className="mt-7 text-center text-sm text-stone-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-bold text-amber-700 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}

export default Login