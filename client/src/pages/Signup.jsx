import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    otp: '',
    applySeller: false,
  });

  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSendOtp = async () => {
    setError('');
    setMessage('');

    const email = form.email.trim().toLowerCase();

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/send-otp', { email });

      setOtpSent(true);
      setVerified(false);
      setForm((prev) => ({
        ...prev,
        email,
        otp: '',
      }));

      setMessage(
        res.data.message || 'OTP sent to your email.'
      );
    } catch (err) {
      setError(
        err.response?.data?.error || 'Could not send OTP.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');

    const email = form.email.trim().toLowerCase();

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setResending(true);

      const res = await api.post('/resend-otp', { email });

      setForm((prev) => ({
        ...prev,
        email,
        otp: '',
      }));

      setMessage(
        res.data.message || 'OTP resent successfully.'
      );
    } catch (err) {
      setError(
        err.response?.data?.error || 'Could not resend OTP.'
      );
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setMessage('');

    const email = form.email.trim().toLowerCase();
    const otp = form.otp.trim();

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/verify-otp', {
        email,
        otp,
      });

      setVerified(true);

      setMessage(
        res.data.message || 'Email verified successfully.'
      );
    } catch (err) {
      setError(
        err.response?.data?.error || 'OTP verification failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!verified) {
      setError('Please verify your email with OTP first.');
      return;
    }

    if (!form.username.trim() || !form.password) {
      setError('Please enter username and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/api/auth/register', {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        applySeller: form.applySeller,
      });

      if (response.data?.success !== true) {
        throw new Error(
          response.data?.message ||
            'Signup could not be completed.'
        );
      }

      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Signup could not be completed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fdfbf7]">
      <Navbar />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-amber-200/60 bg-white shadow-xl shadow-amber-900/5 md:grid-cols-2">

          {/* Left Side - Signup Image Container */}
          <div className="relative flex min-h-[320px] flex-col justify-between bg-[#331e14] p-6 text-white sm:p-8 md:min-h-[640px]">
            <img
              src="/images/signup.png"
              alt="PADAM Traders Signup"
              className="absolute inset-0 h-full w-full object-contain object-center p-2"
            />

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10 pointer-events-none" />

            <div className="relative z-10">
              <p className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-300 backdrop-blur-md">
                PADAM TRADERS
              </p>
            </div>

            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white">
                Join Our Journey,<br />Experience Purity.
              </h1>
              <p className="mt-2 text-sm text-amber-100/90">
                Create an account to start shopping or apply as a seller.
              </p>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="flex items-center justify-center p-6 sm:p-10 md:p-12 bg-white">
            <div className="w-full max-w-sm">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                  Get Started
                </p>
                <h2 className="mt-1 text-3xl font-bold text-stone-900">
                  Create Account
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Sign up to manage orders and explore our catalog.
                </p>
              </div>

              {message && (
                <div
                  role="status"
                  className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3.5 text-sm font-medium text-green-800"
                >
                  {message}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700"
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
                    placeholder="Choose a username"
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
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      disabled={verified}
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="min-w-0 flex-1 rounded-xl border border-amber-200/80 bg-stone-50/50 px-4 py-3 text-stone-800 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10 disabled:bg-stone-100 disabled:text-stone-500"
                    />

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || resending || verified}
                      className="rounded-xl bg-amber-700 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-amber-800 disabled:opacity-60"
                    >
                      {loading
                        ? 'Sending...'
                        : otpSent
                          ? 'Send Again'
                          : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && !verified && (
                  <div className="rounded-xl bg-amber-50/50 p-3 border border-amber-200/60 space-y-3">
                    <div>
                      <label
                        htmlFor="otp"
                        className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-900"
                      >
                        Enter Email OTP
                      </label>
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="text"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                        value={form.otp}
                        onChange={handleChange}
                        placeholder="6-character OTP"
                        className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-stone-800 outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={loading || resending}
                        className="flex-1 rounded-lg bg-green-700 py-2 text-xs font-bold text-white hover:bg-green-800 disabled:opacity-60"
                      >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resending || loading}
                        className="rounded-lg border border-amber-700 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100/50 disabled:opacity-60"
                      >
                        {resending ? 'Sending...' : 'Resend'}
                      </button>
                    </div>
                  </div>
                )}

                {verified && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-700">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Email verified successfully
                  </div>
                )}

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
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full rounded-xl border border-amber-200/80 bg-stone-50/50 px-4 py-3 text-stone-800 outline-none transition focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                  />
                </div>

                <label className="flex items-start gap-3 pt-1 text-xs text-stone-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="applySeller"
                    checked={form.applySeller}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-stone-300 text-amber-700 focus:ring-amber-500 accent-amber-700"
                  />
                  <span>
                    I want to apply for a Seller account. (Subject to admin approval)
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !verified}
                  className="mt-2 w-full rounded-xl bg-amber-700 px-4 py-3.5 font-bold text-white shadow-md shadow-amber-900/10 transition active:scale-[0.99] hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-stone-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-amber-700 hover:text-amber-800 hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Signup;