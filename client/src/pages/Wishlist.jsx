
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchWishlist() {
      try {
        const response = await api.get('/api/wishlist');

        if (active) {
          setProducts(
            Array.isArray(response.data) ? response.data : []
          );
        }
      } catch (err) {
        if (!active) return;

        if (err.response?.status === 401) {
          window.location.assign('/login');
          return;
        }

        setError(
          err.response?.data?.message ||
          'Could not load your wishlist. Please try again.'
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchWishlist();

    return () => {
      active = false;
    };
  }, []);

  function handleWishlistChange(productId, isWishlisted) {
    if (!isWishlisted) {
      setProducts(current =>
        current.filter(product => product._id !== productId)
      );
    }
  }

  return (
    <main className="min-h-screen bg-amber-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#281914]">
              My Wishlist
            </h1>
            <p className="mt-2 text-stone-600">
              Products you have saved for later.
            </p>
          </div>

          <Link
            to="/products"
            className="rounded-lg bg-[#281914] px-5 py-3 font-semibold text-amber-200 hover:bg-amber-800"
          >
            Browse Products
          </Link>
        </div>

        {loading ? (
          <p className="py-12 text-center text-stone-600">
            Loading your wishlist...
          </p>
        ) : error ? (
          <p className="py-12 text-center text-red-700">
            {error}
          </p>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-amber-100 bg-white px-6 py-12 text-center">
            <h2 className="text-xl font-semibold text-[#281914]">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-stone-600">
              Add products to your wishlist and they will appear here.
            </p>
            <Link
              to="/products"
              className="mt-5 inline-block rounded-lg bg-[#281914] px-5 py-3 font-semibold text-amber-200 hover:bg-amber-800"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                initiallyWishlisted={true}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Wishlist;
