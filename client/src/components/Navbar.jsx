
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [auth, setAuth] = useState({
    loading: true,
    loggedIn: false,
    user: null,
  });

  const location = useLocation();

  // Get the latest login status and cart count from the backend.
  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me');

      setAuth({
        loading: false,
        loggedIn: Boolean(res.data.loggedIn),
        user: res.data.loggedIn ? res.data.user : null,
      });
    } catch (err) {
      console.error('Auth status error:', err);

      setAuth({
        loading: false,
        loggedIn: false,
        user: null,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleFocus = () => checkAuth();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [checkAuth, location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  // Logout
  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');

      setAuth({
        loading: false,
        loggedIn: false,
        user: null,
      });

      closeMenu();
      window.location.assign('/');
    } catch (err) {
      console.error('Logout error:', err);

      alert(
        err.response?.data?.error ||
          'Logout failed. Please check the backend.'
      );
    }
  };

  const user = auth.user;

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const canAddProduct =
    isAdmin ||
    (
      user?.role?.toLowerCase() === 'seller' &&
      user?.sellerStatus?.toLowerCase() === 'approved'
    );

  // Display the exact count returned by the backend.
  const cartCount = Math.max(
    0,
    Number(user?.cartCount) || 0
  );

  const navLinkClass =
    'whitespace-nowrap transition-colors hover:text-white';

  const closeMenuAndNavigate = () => closeMenu();

  return (
    <nav className="sticky top-0 z-50 border-b border-amber-300/20 bg-[#281914]/95 text-amber-200 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenuAndNavigate}
          className="text-xl font-extrabold tracking-widest text-amber-300 sm:text-2xl"
        >
          PADAM TRADERS
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-lg px-3 py-2 text-2xl transition hover:bg-white/10 md:hidden"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation links */}
        <div
          className={`${
            menuOpen ? 'flex' : 'hidden'
          } absolute left-0 top-full max-h-[80vh] w-full flex-col gap-5 overflow-y-auto border-t border-amber-300/10 bg-[#281914] px-6 py-5 md:static md:flex md:max-h-none md:w-auto md:flex-row md:items-center md:gap-5 md:overflow-visible md:border-0 md:bg-transparent md:p-0`}
        >

          {/* User greeting */}
          {auth.loading ? (
            <span className="text-sm text-amber-100">
              Checking login...
            </span>
          ) : auth.loggedIn && user ? (
            <span className="font-semibold text-amber-100">
              👋 Hello, {user.username}
            </span>
          ) : null}

          {/* Home */}
          <Link
            to="/"
            onClick={closeMenu}
            className={navLinkClass}
          >
            Home
          </Link>

          {/* Products */}
          <Link
            to="/products"
            onClick={closeMenu}
            className={navLinkClass}
          >
            View Products
          </Link>

          {/* Add Product */}
          {!auth.loading && auth.loggedIn && canAddProduct && (
            <Link
              to="/products/new"
              onClick={closeMenu}
              className="rounded-lg bg-amber-400 px-4 py-2 text-center font-bold text-stone-900 transition hover:bg-amber-300"
            >
              + Add Product
            </Link>
          )}

          {/* React Admin Panel */}
          {!auth.loading && auth.loggedIn && isAdmin && (
            <Link
              to="/admin-panel"
              onClick={closeMenu}
              className="rounded-lg border border-amber-400/60 px-4 py-2 text-center font-semibold text-amber-300 transition hover:bg-amber-300 hover:text-stone-900"
            >
              Admin Panel
            </Link>
          )}

          {/* Wishlist */}
          {!auth.loading && auth.loggedIn && (
            <Link
              to="/wishlist"
              onClick={closeMenu}
              className={navLinkClass}
            >
              <span aria-hidden="true">♡ </span>
              Wishlist
            </Link>
          )}

          {/* About */}
          <Link
            to="/about"
            onClick={closeMenu}
            className={navLinkClass}
          >
            About
          </Link>

          {/* Contact */}
          <Link
            to="/contact"
            onClick={closeMenu}
            className={navLinkClass}
          >
            Contact
          </Link>

          {/* Logged-in navigation */}
          {!auth.loading && auth.loggedIn && user ? (
            <>
              {/* Cart */}
              <Link
                to="/cart"
                onClick={closeMenu}
                className="flex items-center gap-1.5 transition-colors hover:text-white"
                aria-label={`Cart, ${cartCount} items`}
              >
                <span>🛒 Cart</span>

                {cartCount > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold leading-4 text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            !auth.loading && (
              <>
                {/* Login */}
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={navLinkClass}
                >
                  Login
                </Link>

                {/* Signup */}
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="rounded-lg bg-amber-400 px-4 py-2 text-center font-bold text-stone-900 transition hover:bg-amber-300"
                >
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
