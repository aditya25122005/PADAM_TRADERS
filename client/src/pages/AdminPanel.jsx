import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const sections = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'sellers', label: 'Sellers', icon: '🏬' },
  { id: 'pending-sellers', label: 'Seller Requests', icon: '⏳' },
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'messages', label: 'Messages', icon: '💬' }
];

const sectionTitles = {
  dashboard: 'Dashboard Overview',
  users: 'Manage Registered Users',
  sellers: 'Approved Merchant Network',
  'pending-sellers': 'Pending Seller Applications',
  products: 'Inventory & Products Catalog',
  messages: 'Customer Messages & Inquiries'
};

function formatDate(date) {
  if (!date) return '—';

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function StatusBadge({ status }) {
  const styles = {
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200/80',
    Admin: 'bg-purple-50 text-purple-700 border-purple-200/80',
    Seller: 'bg-blue-50 text-blue-700 border-blue-200/80',
    Buyer: 'bg-stone-100 text-stone-700 border-stone-200/80'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] || 'bg-stone-100 text-stone-600 border-stone-200'
      }`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {status || '—'}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-800 border border-amber-200/60 shadow-sm">
        📦
      </div>
      <p className="mt-4 text-base font-bold text-stone-800">{text}</p>
      <p className="mt-1 text-xs text-stone-400">There are no records to display at this moment.</p>
    </div>
  );
}

function AdminPanel() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const loadData = useCallback(async (section, showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');

    try {
      const response = await api.get(`/api/admin/${section}`);
      setData(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.assign('/login');
        return;
      }

      setError(
        err.response?.data?.message ||
        'Unable to load administrative records. Please try again.'
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeSection);
  }, [activeSection, loadData]);

  async function performAction({ id, url, method, confirmText }) {
    if (busyId) return;

    if (confirmText && !window.confirm(confirmText)) {
      return;
    }

    setBusyId(id);

    try {
      await api[method](url);
      await loadData(activeSection, false);
    } catch (err) {
      alert(
        err.response?.data?.message ||
        'Action failed. Please try again.'
      );
    } finally {
      setBusyId('');
    }
  }

  const stats = data?.stats;

  function renderDashboard() {
    if (!stats) return null;

    const metrics = [
      {
        label: 'Total Registered Users',
        value: stats.totalUsers,
        icon: (
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        badgeBg: 'bg-blue-50 border-blue-200/60'
      },
      {
        label: 'Approved Merchants',
        value: stats.totalSellers,
        icon: (
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
        badgeBg: 'bg-emerald-50 border-emerald-200/60'
      },
      {
        label: 'Pending Seller Applications',
        value: stats.pendingSellers,
        icon: (
          <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        badgeBg: 'bg-amber-50 border-amber-200/60'
      },
      {
        label: 'Total Products Listed',
        value: stats.totalProducts,
        icon: (
          <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
        badgeBg: 'bg-purple-50 border-purple-200/60'
      },
      {
        label: 'Customer Inquiries',
        value: stats.messagesCount,
        icon: (
          <svg className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
        badgeBg: 'bg-pink-50 border-pink-200/60'
      },
      {
        label: 'Total Inventory Units',
        value: Number(stats.totalStock || 0).toLocaleString('en-IN'),
        icon: (
          <svg className="h-6 w-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        ),
        badgeBg: 'bg-amber-100/70 border-amber-200'
      }
    ];

    const sellerStats = data.productsBySeller || [];
    const quantityStats = data.quantityStats || [];

    const maxSellerProducts = Math.max(...sellerStats.map(s => s.productCount || 0), 1);
    const maxQuantityStock = Math.max(...quantityStats.map(q => q.stock || 0), 1);

    return (
      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map(metric => (
            <div
              key={metric.label}
              className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-black text-stone-900">
                    {metric.value ?? 0}
                  </p>
                </div>

                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${metric.badgeBg} shadow-xs`}>
                  {metric.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {/* Seller Distribution */}
          <section className="overflow-hidden rounded-2xl border border-amber-200/60 bg-white shadow-sm">
            <div className="border-b border-stone-100 bg-stone-50/60 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900">
                    Products Distribution by Seller
                  </h3>
                  <p className="text-xs text-stone-500">
                    Visual comparison of products listed per merchant
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                  {sellerStats.length} Merchants
                </span>
              </div>
            </div>

            {sellerStats.length === 0 ? (
              <EmptyState text="No seller product data available." />
            ) : (
              <div className="p-6 space-y-5">
                {sellerStats.map(seller => {
                  const percentage = Math.round((seller.productCount / maxSellerProducts) * 100);
                  return (
                    <div key={seller.sellerId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <div className="truncate pr-4">
                          <span className="font-bold text-stone-800">{seller.sellerName}</span>
                          <span className="ml-2 text-stone-400">({seller.sellerEmail})</span>
                        </div>
                        <div className="flex items-center space-x-3 text-stone-600 shrink-0">
                          <span><strong className="text-amber-900">{seller.productCount}</strong> items</span>
                          <span className="text-stone-300">|</span>
                          <span><strong className="text-stone-800">{seller.totalStock}</strong> stock</span>
                        </div>
                      </div>
                      <div className="h-3 w-full rounded-full bg-stone-100 p-0.5">
                        <div
                          className="h-full rounded-full bg-amber-700 transition-all duration-700"
                          style={{ width: `${Math.max(percentage, 8)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Inventory Levels */}
          <section className="overflow-hidden rounded-2xl border border-amber-200/60 bg-white shadow-sm">
            <div className="border-b border-stone-100 bg-stone-50/60 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900">
                    Inventory Levels by Packaging
                  </h3>
                  <p className="text-xs text-stone-500">
                    Stock breakdown by volume / package size
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                  {quantityStats.length} Variants
                </span>
              </div>
            </div>

            {quantityStats.length === 0 ? (
              <EmptyState text="No quantity data available." />
            ) : (
              <div className="p-6 space-y-5">
                {quantityStats.map((item, index) => {
                  const percentage = Math.round((item.stock / maxQuantityStock) * 100);
                  return (
                    <div key={`${item._id}-${index}`} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <div className="flex items-center space-x-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 font-bold text-amber-900 text-xs">
                            🛢️
                          </span>
                          <span className="font-bold text-stone-800">{item._id || 'Standard'}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-stone-600">
                          <span className="text-stone-500">{item.count} line(s)</span>
                          <span className="rounded-md bg-stone-100 px-2 py-0.5 font-bold text-stone-800">
                            {item.stock} in stock
                          </span>
                        </div>
                      </div>

                      <div className="h-3 w-full rounded-full bg-stone-100 p-0.5">
                        <div
                          className="h-full rounded-full bg-emerald-600 transition-all duration-700"
                          style={{ width: `${Math.max(percentage, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* CTA Review Box */}
        <button
          type="button"
          onClick={() => setActiveSection('pending-sellers')}
          className="group flex w-full items-center justify-between rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50 to-white p-6 text-left shadow-sm transition-all hover:border-amber-400 hover:shadow-md"
        >
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-700 text-2xl text-white shadow-md">
              ⏳
            </div>
            <div>
              <p className="text-base font-bold text-stone-900">
                Review Pending Merchant Applications
              </p>
              <p className="mt-0.5 text-xs text-stone-600">
                There are <span className="font-bold text-amber-900">{stats.pendingSellers || 0} applications</span> awaiting your administrative verification.
              </p>
            </div>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-900 transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    );
  }

  function renderUsers() {
    const users = data?.users || [];

    if (!users.length) {
      return <EmptyState text="No users found." />;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50/80 text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200/60">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email Address</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Seller Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {users.map(user => (
              <tr key={user._id} className="transition-colors hover:bg-amber-50/30">
                <td className="px-6 py-4 font-bold text-stone-900">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-900 text-xs">
                      {(user.username || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span>{user.username || '—'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-stone-600">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.role} />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.sellerStatus} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    disabled={busyId === user._id}
                    onClick={() => performAction({
                      id: user._id,
                      url: `/api/admin/users/${user._id}`,
                      method: 'delete',
                      confirmText: `Delete user "${user.username}"? This action cannot be undone.`
                    })}
                    className="inline-flex items-center rounded-xl border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-600 transition-all hover:bg-rose-600 hover:text-white disabled:opacity-50"
                  >
                    {busyId === user._id ? 'Deleting...' : 'Delete User'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderSellers() {
    const sellers = data?.sellers || [];

    if (!sellers.length) {
      return <EmptyState text="No sellers found." />;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50/80 text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200/60">
            <tr>
              <th className="px-6 py-4">Merchant</th>
              <th className="px-6 py-4">Contact Email</th>
              <th className="px-6 py-4">Approval Status</th>
              <th className="px-6 py-4">Applied Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {sellers.map(seller => (
              <tr key={seller._id} className="transition-colors hover:bg-amber-50/30">
                <td className="px-6 py-4 font-bold text-stone-900">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-900 text-xs">
                      🏬
                    </div>
                    <span>{seller.username || '—'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-stone-600">
                  {seller.email}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={seller.sellerStatus} />
                </td>
                <td className="px-6 py-4 text-xs font-medium text-stone-500">
                  {formatDate(seller.sellerAppliedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderPendingSellers() {
    const pending = data?.pending || [];

    if (!pending.length) {
      return <EmptyState text="No pending seller applications." />;
    }

    return (
      <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-2">
        {pending.map(seller => (
          <article
            key={seller._id}
            className="flex flex-col justify-between rounded-2xl border border-amber-200/80 bg-white p-6 shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 font-bold text-amber-900">
                    👤
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900">
                      {seller.username || 'Unnamed user'}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {seller.email}
                    </p>
                  </div>
                </div>
                <StatusBadge status="pending" />
              </div>

              <div className="mt-4 rounded-xl border border-stone-100 bg-stone-50/60 p-3 text-xs text-stone-600">
                <span className="font-semibold text-stone-700">Applied on:</span> {formatDate(seller.sellerAppliedAt)}
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-3">
              <button
                disabled={busyId === seller._id}
                onClick={() => performAction({
                  id: seller._id,
                  url: `/api/admin/pending-sellers/${seller._id}/approve`,
                  method: 'patch',
                  confirmText: `Approve ${seller.username}'s seller application?`
                })}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {busyId === seller._id ? 'Processing...' : '✓ Approve Merchant'}
              </button>

              <button
                disabled={busyId === seller._id}
                onClick={() => performAction({
                  id: seller._id,
                  url: `/api/admin/pending-sellers/${seller._id}/reject`,
                  method: 'patch',
                  confirmText: `Reject ${seller.username}'s seller application?`
                })}
                className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  /* FIXED PRODUCT NAME / QUANTITY HEADING BUG HERE */
  function renderProducts() {
    const products = data?.products || [];

    if (!products.length) {
      return <EmptyState text="No products found in database." />;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50/80 text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200/60">
            <tr>
              <th className="px-6 py-4">Product Details</th>
              <th className="px-6 py-4">Merchant / Seller</th>
              <th className="px-6 py-4">Unit Price</th>
              <th className="px-6 py-4">Stock Level</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {products.map(product => {
              // Priority fallback to display accurate product title
              const productName = product.name || product.title || product.productName || 'Mustard Oil Bottle';
              const productQuantity = product.quantity || product.size || product.variant || 'Standard Pack';

              return (
                <tr key={product._id} className="transition-colors hover:bg-amber-50/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      {product.img || product.image ? (
                        <img
                          src={product.img || product.image}
                          alt={productName}
                          className="h-12 w-12 shrink-0 rounded-xl border border-stone-200 bg-white object-contain p-1 shadow-2xs"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 font-bold text-amber-900 text-base">
                          🛢️
                        </div>
                      )}
                      <div>
                        {/* FIX: Heading properly displays Product Name */}
                        <p className="font-bold text-stone-900 text-sm sm:text-base">
                          {productName}
                        </p>
                        {/* Subtitle displays Quantity/Variant */}
                        <span className="inline-block mt-0.5 rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
                          Pack Size: {productQuantity}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-stone-600">
                    {product.author?.username || product.sellerName || 'Padam Traders'}
                  </td>
                  <td className="px-6 py-4 font-bold text-amber-900">
                    ₹{Number(product.price || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      (product.stock || 0) > 10 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {product.stock ?? 0} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      disabled={busyId === product._id}
                      onClick={() => performAction({
                        id: product._id,
                        url: `/api/admin/products/${product._id}`,
                        method: 'delete',
                        confirmText: `Permanently delete "${productName}"?`
                      })}
                      className="inline-flex items-center rounded-xl border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-600 transition-all hover:bg-rose-600 hover:text-white disabled:opacity-50"
                    >
                      {busyId === product._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function renderMessages() {
    const messages = data?.messages || [];

    if (!messages.length) {
      return <EmptyState text="No customer messages found." />;
    }

    return (
      <div className="divide-y divide-stone-100">
        {messages.map(message => (
          <article
            key={message._id}
            className="flex flex-col gap-4 p-6 transition-colors hover:bg-amber-50/20 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900">
                  ✉️
                </span>
                <h3 className="font-bold text-stone-900">
                  {message.name ||
                    message.subject ||
                    message.userId?.username ||
                    'Customer Message'}
                </h3>
              </div>

              <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-4">
                <p className="break-words text-sm leading-relaxed text-stone-700">
                  {message.message ||
                    message.content ||
                    message.body ||
                    message.text ||
                    'No message content available.'}
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs text-stone-500">
                <span>Contact: <strong>{message.contactNo || message.phone || 'N/A'}</strong></span>
                <span>•</span>
                <span>Email: {message.email || message.userId?.email || 'N/A'}</span>
                {message.createdAt && (
                  <>
                    <span>•</span>
                    <span>{formatDate(message.createdAt)}</span>
                  </>
                )}
              </div>
            </div>

            <button
              disabled={busyId === message._id}
              onClick={() => performAction({
                id: message._id,
                url: `/api/admin/messages/${message._id}`,
                method: 'delete',
                confirmText: 'Delete this customer message?'
              })}
              className="self-start rounded-xl border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-600 hover:text-white disabled:opacity-50"
            >
              {busyId === message._id ? 'Deleting...' : 'Delete Message'}
            </button>
          </article>
        ))}
      </div>
    );
  }

  function renderContent() {
    if (loading) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-stone-500">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-amber-700 border-t-transparent" />
          <p className="text-sm font-semibold text-stone-600">Loading administrative records...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mx-auto my-12 max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-800">{error}</p>
          <button
            onClick={() => loadData(activeSection)}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-700 px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-amber-800"
          >
            Try Again
          </button>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'sellers':
        return renderSellers();
      case 'pending-sellers':
        return renderPendingSellers();
      case 'products':
        return renderProducts();
      case 'messages':
        return renderMessages();
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans text-stone-800 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-amber-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700 text-xl font-black text-white shadow-md">
              P
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">
                PADAM TRADERS
              </p>
              <h1 className="text-lg font-extrabold text-stone-900 sm:text-xl">
                Control Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200/60">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span>System Live</span>
            </span>
            <a
              href="/products"
              className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 shadow-sm transition hover:bg-stone-50"
            >
              View Storefront ↗
            </a>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        
        {/* Sidebar */}
        <aside className="h-fit rounded-3xl border border-amber-200/60 bg-[#2b170e] p-4 text-amber-100 shadow-xl">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
            Management Panel
          </p>

          <nav className="flex gap-1.5 overflow-x-auto lg:flex-col">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex shrink-0 items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold transition-all lg:w-full ${
                  activeSection === section.id
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-amber-100/70 hover:bg-amber-900/40 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm">{section.icon}</span>
                  <span>{section.label}</span>
                </div>
                {section.id === 'pending-sellers' &&
                  stats?.pendingSellers > 0 && (
                    <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-stone-950">
                      {stats.pendingSellers}
                    </span>
                  )}
              </button>
            ))}
          </nav>

          <div className="mt-6 hidden rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 lg:block">
            <p className="text-xs font-bold text-amber-400">
              Admin Governance
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-amber-100/70">
              Manage seller authorization, catalog operations, and customer inquiries with real-time controls.
            </p>
          </div>
        </aside>

        {/* Content Region */}
        <main className="min-w-0">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-stone-500">
                Administration / <span className="font-bold text-stone-800">{sectionTitles[activeSection]}</span>
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                {sectionTitles[activeSection]}
              </h2>
            </div>

            <button
              onClick={() => loadData(activeSection)}
              disabled={loading}
              className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
            >
              <span className={`mr-1.5 ${loading ? 'animate-spin' : ''}`}>↻</span>
              Refresh Records
            </button>
          </div>

          <section className="overflow-hidden rounded-3xl border border-amber-200/60 bg-white shadow-xl shadow-amber-900/5">
            {renderContent()}
          </section>

          <p className="mt-8 text-center text-xs font-medium text-stone-400">
            PADAM TRADERS • High-Volume Mustard Oil Commerce Administrative System
          </p>
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;