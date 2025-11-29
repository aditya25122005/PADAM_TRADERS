// routes/admin.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const Product = require('../models/Product');
const Message = require('../models/Message');

const { isAdmin } = require('../middleware'); 


// =========================
// ADMIN DASHBOARD
// =========================
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalSellers = await User.countDocuments({ role: 'Seller', sellerStatus: 'approved' });
    const pendingSellers = await User.countDocuments({ sellerStatus: 'pending' });
    const totalProducts = await Product.countDocuments({});
    const messagesCount = await Message.countDocuments({});

    const totalStockAgg = await Product.aggregate([
      { $group: { _id: null, totalStock: { $sum: '$stock' } } }
    ]);
    const totalStock = (totalStockAgg[0] && totalStockAgg[0].totalStock) || 0;

    const productsBySeller = await Product.aggregate([
      { $group: { _id: '$author', productCount: { $sum: 1 }, totalStock: { $sum: '$stock' } } },
      { $sort: { productCount: -1 } },
      { $limit: 20 }
    ]);

    const sellerIds = productsBySeller.map(p => new mongoose.Types.ObjectId(p._id));
    const sellers = await User.find({ _id: { $in: sellerIds } }, 'username email');

    let sellerMap = {};
    sellers.forEach(s => { sellerMap[s._id] = s; });

    const productsBySellerView = productsBySeller.map(p => ({
      sellerId: p._id,
      sellerName: sellerMap[p._id]?.username || 'Unknown',
      sellerEmail: sellerMap[p._id]?.email || '',
      productCount: p.productCount,
      totalStock: p.totalStock
    }));

    const qtyAgg = await Product.aggregate([
      { $group: { _id: '$quantity', count: { $sum: 1 }, stock: { $sum: '$stock' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topSellers = productsBySellerView.slice(0, 6);
    const chartSellerLabels = topSellers.map(s => s.sellerName || 'Seller');
    const chartSellerCounts = topSellers.map(s => s.productCount);

    res.render('admin/dashboard', {
      pageTitle: 'Admin Dashboard',
      active: 'dashboard',

      totalUsers,
      totalSellers,
      pendingSellers,
      totalProducts,
      messagesCount,
      totalStock,

      productsBySellerView,
      qtyAgg,

      chartSellerLabels,
      chartSellerCounts
    });

  } catch (e) {
    console.error(e);
    req.flash('error', 'Unable to load admin dashboard');
    res.redirect('/');
  }
});


// =========================
// USERS
// =========================
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).sort({ username: 1 });
    res.render('admin/users', {
      users,
      pageTitle: 'All Users',
      active: 'users'
    });
  } catch (e) {
    req.flash('error', 'Cannot load users');
    res.redirect('/admin/dashboard');
  }
});

router.post('/users/:id/delete', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'User deleted');
    res.redirect('/admin/users');
  } catch (e) {
    req.flash('error', 'Failed to delete user');
    res.redirect('/admin/users');
  }
});


// =========================
// SELLERS
// =========================
router.get('/sellers', isAdmin, async (req, res) => {
  try {
    const sellers = await User.find({ role: 'Seller' }).sort({ username: 1 });
    res.render('admin/sellers', {
      sellers,
      pageTitle: 'Sellers',
      active: 'sellers'
    });
  } catch (e) {
    req.flash('error', 'Cannot load sellers');
    res.redirect('/admin/dashboard');
  }
});


router.get('/seller/:id/products', isAdmin, async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);
    if (!seller) {
      req.flash('error', 'Seller not found');
      return res.redirect('/admin/sellers');
    }

    const products = await Product.find({ author: req.params.id });

    res.render('admin/sellerProducts', {
      seller,
      products,
      pageTitle: `${seller.username} - Products`,
      active: 'sellers'
    });

  } catch (e) {
    req.flash('error', 'Cannot load seller products');
    res.redirect('/admin/sellers');
  }
});


// =========================
// MESSAGES
// =========================
router.get('/messages', isAdmin, async (req, res) => {
  try {
    const messages = await Message.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'username email');

    res.render('admin/messages', {
      messages,
      pageTitle: 'Customer Messages',
      active: 'messages'
    });

  } catch (e) {
    req.flash('error', 'Cannot load messages');
    res.redirect('/admin/dashboard');
  }
});


router.post('/messages/:id/delete', isAdmin, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    req.flash('success', 'Message deleted');
    res.redirect('/admin/messages');
  } catch (e) {
    req.flash('error', 'Failed to delete message');
    res.redirect('/admin/messages');
  }
});


// =========================
// PENDING SELLERS
// =========================
router.get('/pending-sellers', isAdmin, async (req, res) => {
  try {
    const pending = await User.find({ sellerStatus: 'pending' }).sort({ sellerAppliedAt: -1 });

    res.render('admin/pendingSellers', {
      pending,
      pageTitle: 'Pending Seller Applications',
      active: 'pending'
    });

  } catch (e) {
    req.flash('error', 'Cannot load pending sellers');
    res.redirect('/admin/dashboard');
  }
});


router.post('/pending-sellers/:id/approve', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      role: 'Seller',
      sellerStatus: 'approved',
      sellerApprovedAt: Date.now()
    });

    req.flash('success', 'Seller approved');
    res.redirect('/admin/pending-sellers');
  } catch (e) {
    req.flash('error', 'Approval failed');
    res.redirect('/admin/pending-sellers');
  }
});

router.post('/pending-sellers/:id/reject', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      sellerStatus: 'rejected'
    });

    req.flash('success', 'Seller rejected');
    res.redirect('/admin/pending-sellers');
  } catch (e) {
    req.flash('error', 'Rejection failed');
    res.redirect('/admin/pending-sellers');
  }
});


module.exports = router;
