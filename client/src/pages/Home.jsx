import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchProducts() {
      try {
        const res = await api.get('/api/products');

        if (active) {
          setProducts(
            Array.isArray(res.data) ? res.data : []
          );
        }
      } catch (err) {
        console.error('Products fetch error:', err);

        if (active) {
          setError(
            'Could not load products. Please try again.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased selection:bg-amber-500 selection:text-white">
      <Navbar />
      <Hero />

      {/* Trust & Quality Highlights Bar */}
      <section className="border-y border-amber-200/60 bg-amber-50/70 py-6 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 sm:grid-cols-4 sm:px-8">
          <div className="flex items-center space-x-3 rounded-xl bg-white/60 p-3 shadow-xs border border-amber-100/80">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">100% Pure</p>
              <p className="text-xs text-stone-500">Unadulterated Quality</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-xl bg-white/60 p-3 shadow-xs border border-amber-100/80">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Cold Pressed</p>
              <p className="text-xs text-stone-500">Traditional Kachi Ghani</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-xl bg-white/60 p-3 shadow-xs border border-amber-100/80">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Health First</p>
              <p className="text-xs text-stone-500">Rich in Omega-3 & Vitamin E</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-xl bg-white/60 p-3 shadow-xs border border-amber-100/80">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Direct From Mill</p>
              <p className="text-xs text-stone-500">Freshly Packed Batches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main
        id="products"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-800 ring-1 ring-amber-500/20">
            Handcrafted Selection
          </span>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
            Our Premium Collection
          </h2>

          <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
            Explore authentic cold-pressed mustard oils, crafted with care and tradition at <span className="font-semibold text-amber-900">PADAM Traders</span>.
          </p>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="animate-pulse rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs"
              >
                <div className="h-52 w-full rounded-xl bg-stone-200/80" />
                <div className="mt-4 h-5 w-3/4 rounded-md bg-stone-200/80" />
                <div className="mt-2 h-4 w-1/2 rounded-md bg-stone-200/60" />
                <div className="mt-6 flex items-center justify-between">
                  <div className="h-6 w-1/3 rounded-md bg-stone-200/80" />
                  <div className="h-9 w-24 rounded-lg bg-stone-200/80" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="mt-4 text-base font-semibold text-red-800">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-amber-700 active:scale-95"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-amber-200 bg-amber-50/30 p-12 text-center">
            <p className="text-base font-medium text-stone-600">
              No products available right now.
            </p>
            <p className="mt-1 text-xs text-stone-400">Please check back again soon!</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-900/30 bg-[#1c130e] text-amber-100">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center space-x-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-serif text-lg font-bold text-stone-900">
                P
              </span>
              <span className="text-xl font-extrabold tracking-wider text-amber-400">
                PADAM TRADERS
              </span>
            </div>

            <p className="mt-3 max-w-md text-sm text-stone-400">
              Pure. Fresh. Authentic Kachi Ghani Mustard Oil delivered directly from our traditional mills to your doorstep.
            </p>

            <div className="mt-6 h-px w-24 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

            <p className="mt-6 text-xs text-stone-500">
              © {new Date().getFullYear()} PADAM Traders. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;