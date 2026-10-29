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

  // Get the latest auth state
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
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAuth, location.pathname]);

  const closeMenu = () => setMenuOpen(false);

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
        err.response?.data?.error || 'Logout failed. Please try again.'
      );
    }
  };

  const user = auth.user;
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isSeller = user?.role?.toLowerCase() === 'seller' && user?.sellerStatus?.toLowerCase() === 'approved';
  const canAddProduct = isAdmin || isSeller;
  const cartCount = Math.max(0, Number(user?.cartCount) || 0);

  // Active Link Helper
  const isActive = (path) => location.pathname === path;

  const getNavLinkClass = (path) =>
    `text-sm font-semibold transition-all duration-200 px-3 py-1.5 rounded-lg ${
      isActive(path)
        ? 'bg-amber-500/20 text-amber-300 font-bold'
        : 'text-amber-100/80 hover:text-white hover:bg-white/5'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-amber-900/40 bg-[#23150f]/95 text-amber-100 shadow-xl backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">

        {/* Brand Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2 text-xl font-black tracking-widest text-amber-400 sm:text-2xl transition hover:opacity-90"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-700 text-sm font-black text-white shadow-md">
            P
          </span>
          <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent">
            PADAM TRADERS
          </span>
        </Link>

        {/* Right Section Icons & Controls (Desktop & Mobile trigger) */}
        <div className="flex items-center gap-3 md:gap-5">

          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
            <Link to="/" className={getNavLinkClass('/')}>
              Home
            </Link>

            <Link to="/products" className={getNavLinkClass('/products')}>
              Products
            </Link>

            <Link to="/about" className={getNavLinkClass('/about')}>
              About Us
            </Link>

            <Link to="/contact" className={getNavLinkClass('/contact')}>
              Contact
            </Link>

            {!auth.loading && auth.loggedIn && (
              <Link to="/wishlist" className={getNavLinkClass('/wishlist')}>
                <span className="mr-1 text-amber-400">♡</span> Wishlist
              </Link>
            )}

            {!auth.loading && auth.loggedIn && canAddProduct && (
              <Link
                to="/products/new"
                className="ml-1 inline-flex items-center gap-1 rounded-xl bg-amber-700/80 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-95"
              >
                <span>+</span> Add Product
              </Link>
            )}

            {!auth.loading && auth.loggedIn && isAdmin && (
              <Link
                to="/admin-panel"
                className="inline-flex items-center gap-1 rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-amber-400/20 active:scale-95"
              >
                ⚙️ Admin Panel
              </Link>
            )}
          </div>

          <div className="h-5 w-px bg-amber-900/40 hidden md:block" />

          {/* Cart Icon & User Controls */}
          {!auth.loading && auth.loggedIn && user ? (
            <div className="flex items-center gap-3">
              {/* Cart Button */}
              <Link
                to="/cart"
                onClick={closeMenu}
                className="relative flex items-center justify-center rounded-xl bg-white/5 p-2 text-amber-200 transition hover:bg-white/10 hover:text-white"
                aria-label={`Cart, ${cartCount} items`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>

                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-black leading-none text-white shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Avatar Badge (Desktop) */}
              <div className="hidden md:flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 py-1 pl-1 pr-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 font-bold text-xs text-white">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-amber-100 max-w-[100px] truncate">
                  {user.username}
                </span>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="hidden md:inline-flex items-center rounded-xl bg-rose-950/60 border border-rose-800/40 px-3 py-1.5 text-xs font-bold text-rose-300 transition hover:bg-rose-900/80 hover:text-white active:scale-95"
              >
                Logout
              </button>
            </div>
          ) : (
            !auth.loading && (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-xl px-3 py-1.5 text-xs font-bold text-amber-200 hover:text-white transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-amber-700 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-white/5 text-lg text-amber-200 transition hover:bg-white/10 md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {menuOpen && (
        <div className="border-t border-amber-900/50 bg-[#1c110c] px-5 py-6 space-y-4 md:hidden shadow-2xl animate-in slide-in-from-top duration-200">
          {/* User Info header in mobile menu */}
          {auth.loggedIn && user && (
            <div className="flex items-center gap-3 pb-3 border-b border-amber-900/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 font-bold text-white">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{user.username}</p>
                <p className="text-xs text-amber-400/80 capitalize">{user.role || 'Customer'}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Link
              to="/"
              onClick={closeMenu}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold ${isActive('/') ? 'bg-amber-600 text-white' : 'text-amber-100 hover:bg-white/5'}`}
            >
              🏠 Home
            </Link>

            <Link
              to="/products"
              onClick={closeMenu}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold ${isActive('/products') ? 'bg-amber-600 text-white' : 'text-amber-100 hover:bg-white/5'}`}
            >
              📦 View Products
            </Link>

            {auth.loggedIn && (
              <Link
                to="/cart"
                onClick={closeMenu}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold ${isActive('/cart') ? 'bg-amber-600 text-white' : 'text-amber-100 hover:bg-white/5'}`}
              >
                <span>🛒 Shopping Cart</span>
                {cartCount > 0 && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-black text-stone-950">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {auth.loggedIn && (
              <Link
                to="/wishlist"
                onClick={closeMenu}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold ${isActive('/wishlist') ? 'bg-amber-600 text-white' : 'text-amber-100 hover:bg-white/5'}`}
              >
                ♡ Wishlist
              </Link>
            )}

            {auth.loggedIn && canAddProduct && (
              <Link
                to="/products/new"
                onClick={closeMenu}
                className="mt-1 px-4 py-2.5 rounded-xl bg-amber-700/80 text-sm font-bold text-white"
              >
                + Add New Product
              </Link>
            )}

            {auth.loggedIn && isAdmin && (
              <Link
                to="/admin-panel"
                onClick={closeMenu}
                className="px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm font-bold text-amber-300"
              >
                ⚙️ Admin Panel
              </Link>
            )}

            <Link
              to="/about"
              onClick={closeMenu}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold ${isActive('/about') ? 'bg-amber-600 text-white' : 'text-amber-100 hover:bg-white/5'}`}
            >
              ℹ️ About Us
            </Link>

            <Link
              to="/contact"
              onClick={closeMenu}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold ${isActive('/contact') ? 'bg-amber-600 text-white' : 'text-amber-100 hover:bg-white/5'}`}
            >
              📞 Contact Us
            </Link>
          </div>

          {/* Auth Actions in Mobile */}
          <div className="pt-3 border-t border-amber-900/40">
            {auth.loggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl bg-rose-900/60 border border-rose-800/50 py-2.5 text-xs font-bold text-rose-200"
              >
                Log Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-xl border border-amber-500/30 py-2.5 text-center text-xs font-bold text-amber-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="rounded-xl bg-amber-600 py-2.5 text-center text-xs font-bold text-white shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;