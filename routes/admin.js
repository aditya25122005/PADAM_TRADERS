// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const { isAdmin } = require("../middleware");

// ---------------- Dashboard ----------------
router.get("/admin/dashboard", isAdmin, async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const pendingSellers = await User.countDocuments({ sellerStatus: "pending" });

    res.render("admin/dashboard", {
        totalUsers,
        totalProducts,
        pendingSellers
    });
});

// ---------------- Pending Sellers ----------------
router.get("/admin/pending-sellers", isAdmin, async (req, res) => {
    const pending = await User.find({ sellerStatus: "pending" });
    res.render("admin/pendingSellers", { pending });
});

router.post("/admin/pending-sellers/:id/approve", isAdmin, async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, {
        role: "Seller",
        sellerStatus: "approved",
        sellerApprovedAt: Date.now()
    });
    req.flash("success", "Seller approved.");
    res.redirect("/admin/pending-sellers");
});

router.post("/admin/pending-sellers/:id/reject", isAdmin, async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { sellerStatus: "rejected" });
    req.flash("success", "Seller rejected.");
    res.redirect("/admin/pending-sellers");
});

// ---------------- Manage Users ----------------
router.get("/admin/users", isAdmin, async (req, res) => {
    const users = await User.find().select("-password");
    res.render("admin/manageUsers", { users });
});

// ---------------- Manage Products ----------------
router.get("/admin/products", isAdmin, async (req, res) => {
    const products = await Product.find().populate("author");
    res.render("admin/manageProducts", { products });
});

// Admin delete any product
router.delete("/admin/products/:id", isAdmin, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    req.flash("success", "Product deleted.");
    res.redirect("/admin/products");
});

module.exports = router;
