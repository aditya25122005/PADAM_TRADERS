
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function ProductCard({
  product,
  initiallyWishlisted,
  onWishlistChange
}) {
  const [isWishlisted, setIsWishlisted] = useState(
    Boolean(initiallyWishlisted ?? product.isWishlisted ?? false)
  );

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Sync the heart with the latest wishlist status from the parent.
  useEffect(() => {
    setIsWishlisted(
      Boolean(initiallyWishlisted ?? product.isWishlisted ?? false)
    );
  }, [initiallyWishlisted, product.isWishlisted]);

  // Reset the image fallback if the product image changes.
  useEffect(() => {
    setImageError(false);
  }, [product.img]);

  async function handleWishlist() {
    if (wishlistLoading) return;

    setWishlistLoading(true);

    try {
      const response = await api.post(
        `/products/${product._id}/like`
      );

      // Support both the JSON response and the older "ok" response.
      const updatedState =
        typeof response.data?.wishlisted === 'boolean'
          ? response.data.wishlisted
          : !isWishlisted;

      setIsWishlisted(updatedState);

      onWishlistChange?.(product._id, updatedState);
    } catch (error) {
      if (error.response?.status === 401) {
        alert('Please log in to use your wishlist.');
        window.location.assign('/login');
      } else {
        alert(
          error.response?.data?.message ||
          'Could not update wishlist. Please try again.'
        );
      }
    } finally {
      setWishlistLoading(false);
    }
  }

  const isInStock = Number(product.stock) > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl">

      {/* Product image */}
      <div className="relative flex h-56 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-b from-stone-50 to-white p-5">

        {product.img && !imageError ? (
          <img
            src={product.img}
            alt={product.name || 'PADAM Traders product'}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-stone-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-10 w-10"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="8.5" cy="9" r="1.5" />
              <path d="m21 15-5-5L5 20" />
            </svg>

            <span className="text-sm">No image available</span>
          </div>
        )}

        {/* Wishlist heart */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlistLoading}
          aria-label={
            isWishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          aria-pressed={isWishlisted}
          title={
            isWishlisted
              ? 'Remove from Wishlist'
              : 'Add to Wishlist'
          }
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-stone-100 bg-white shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:cursor-wait disabled:opacity-60"
        >
          {wishlistLoading ? (
            <svg
              className="h-5 w-5 animate-spin text-pink-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-6 w-6 transition-colors duration-200"
              fill={isWishlisted ? '#ec4899' : 'none'}
              stroke={isWishlisted ? '#ec4899' : '#78716c'}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>

        {/* Stock status */}
        <span
          className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
            isInStock
              ? 'bg-green-50 text-green-700 ring-green-100'
              : 'bg-red-50 text-red-700 ring-red-100'
          }`}
        >
          {isInStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      {/* Product information */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-stone-900 transition-colors group-hover:text-amber-800">
          {product.name}
        </h3>

        {product.quantity && (
          <p className="mt-1.5 text-sm font-medium text-stone-500">
            {product.quantity}
          </p>
        )}

        <p className="mt-3 min-h-10 line-clamp-2 text-sm leading-5 text-stone-600">
          {product.desc || ''}
        </p>

        {/* Price and details button */}
        <div className="mt-auto pt-5">
          <p className="text-xl font-extrabold text-amber-800">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </p>

          <Link
            to={`/products/${product._id}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#281914] px-4 py-3 text-sm font-semibold text-amber-100 transition-colors hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            View Details

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14m-7-7 7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
