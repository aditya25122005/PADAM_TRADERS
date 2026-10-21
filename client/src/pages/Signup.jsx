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

  // Send OTP
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

  // Resend OTP using the email entered in the form
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

  // Verify OTP using both email and OTP
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

  // Register through the React JSON API
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

      // The backend sets the JWT cookie.
      // The existing session remains temporarily for compatibility.
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
    <>
      <Navbar />

      <main className="min-h-screen bg-[#21140f] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-amber-500/50 bg-[#fffaf0] p-6 shadow-2xl sm:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-amber-700">
            PADAM TRADERS
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-stone-900">
            Create Account
          </h1>

          <p className="mb-7 mt-2 text-stone-500">
            Sign up to get started.
          </p>

          {message && (
            <div
              role="status"
              className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800"
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
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
                placeholder="Choose a username"
                className="w-full rounded-lg border border-amber-200 bg-white px-4 py-3 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            {/* Email and OTP */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-semibold text-stone-700"
              >
                Email
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
                  className="min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-4 py-3 outline-none focus:border-amber-600 disabled:bg-stone-100"
                />

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || resending || verified}
                  className="rounded-lg bg-amber-700 px-4 py-3 font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
                >
                  {loading
                    ? 'Please wait...'
                    : otpSent
                      ? 'Send OTP Again'
                      : 'Send OTP'}
                </button>
              </div>
            </div>

            {/* OTP input and actions */}
            {otpSent && !verified && (
              <div>
                <label
                  htmlFor="otp"
                  className="mb-2 block font-semibold text-stone-700"
                >
                  Email OTP
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
                  placeholder="Enter 6-character OTP"
                  className="w-full rounded-lg border border-amber-200 bg-white px-4 py-3 outline-none focus:border-amber-600"
                />

                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading || resending}
                    className="rounded-lg bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending || loading}
                    className="rounded-lg border border-amber-700 px-4 py-2 font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-60"
                  >
                    {resending ? 'Resending...' : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}

            {verified && (
              <p className="text-sm font-semibold text-green-700">
                ✓ Email verified
              </p>
            )}

            {/* Password */}
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
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full rounded-lg border border-amber-200 bg-white px-4 py-3 outline-none focus:border-amber-600"
              />
            </div>

            {/* Seller application */}
            <label className="flex items-start gap-3 text-sm text-stone-700">
              <input
                type="checkbox"
                name="applySeller"
                checked={form.applySeller}
                onChange={handleChange}
                className="mt-1 accent-amber-700"
              />

              <span>
                I want to apply for a Seller account. My request may need
                admin approval.
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !verified}
              className="w-full rounded-lg bg-amber-700 px-4 py-3 font-bold text-white shadow-md hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-amber-700 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

export default Signup;