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
    <div className="flex min-h-screen flex-col bg-[#fdfbf7]">
      <Navbar />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-amber-200/60 bg-white shadow-xl shadow-amber-900/5 md:grid-cols-2">

          {/* Left Side - Image Container (No Image Cut) */}
          <div className="relative flex min-h-[320px] flex-col justify-between bg-[#331e14] p-6 text-white sm:p-8 md:min-h-[580px]">
            <img
              src="/images/login.png"
              alt="PADAM Traders Login"
              className="absolute inset-0 h-full w-full object-contain object-center p-2"
            />

            {/* Subtle Gradient overlay for overlay text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10 pointer-events-none" />

            <div className="relative z-10">
              <p className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300 backdrop-blur-md">
                PADAM TRADERS
              </p>
            </div>

            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white">
                Pure Quality,<br />Trusted Service.
              </h1>
              <p className="mt-2 text-sm text-amber-100/90">
                Log in to explore our wide range of premium products.
              </p>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="flex items-center justify-center p-6 sm:p-10 md:p-12 bg-white">
            <div className="w-full max-w-sm">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                  Welcome Back
                </p>
                <h2 className="mt-1 text-3xl font-bold text-stone-900">
                  Account Login
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Please enter your credentials to access your account.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700"
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
                    className="w-full rounded-xl border border-amber-200/80 bg-stone-50/50 px-4 py-3 text-stone-800 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-700"
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
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-amber-200/80 bg-stone-50/50 px-4 py-3 text-stone-800 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-amber-700 px-4 py-3.5 font-bold text-white shadow-md shadow-amber-900/10 transition active:scale-[0.99] hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Logging in...' : 'Sign In'}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-stone-200" />
                <span className="text-xs font-medium text-stone-400">OR</span>
                <div className="h-px flex-1 bg-stone-200" />
              </div>

              <a
                href="http://localhost:8085/auth/google"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white px-4 py-3 font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-[0.99]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </a>

              <p className="mt-6 text-center text-sm text-stone-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-bold text-amber-700 hover:text-amber-800 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Login