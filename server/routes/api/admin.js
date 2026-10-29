const express = require("express");
const mongoose = require("mongoose");

const User = require("../../models/User");
const Product = require("../../models/Product");
const Message = require("../../models/Message");
const { isLoggedIn, isAdmin } = require("../../middleware");

const router = express.Router();

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.use(isLoggedIn, isAdmin);

// Dashboard statistics
router.get("/api/admin/dashboard", async (req, res) => {
    try {
        const [
            totalUsers,
            totalSellers,
            pendingSellers,
            totalProducts,
            messagesCount,
            totalStockAgg,
            productsBySeller,
            qtyAgg,
        ] = await Promise.all([
            User.countDocuments({}),
            User.countDocuments({
                role: "Seller",
                sellerStatus: "approved",
            }),
            User.countDocuments({ sellerStatus: "pending" }),
            Product.countDocuments({}),
            Message.countDocuments({}),
            Product.aggregate([
                {
                    $group: {
                        _id: null,
                        totalStock: { $sum: "$stock" },
                    },
                },
            ]),
            Product.aggregate([
                { $match: { author: { $type: "objectId" } } },
                {
                    $group: {
                        _id: "$author",
                        productCount: { $sum: 1 },
                        totalStock: { $sum: "$stock" },
                    },
                },
                { $sort: { productCount: -1 } },
                { $limit: 20 },
            ]),
            Product.aggregate([
                {
                    $group: {
                        _id: "$quantity",
                        count: { $sum: 1 },
                        stock: { $sum: "$stock" },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),
        ]);

        const sellerIds = productsBySeller.map((item) => item._id);

        const sellers = await User.find({
            _id: { $in: sellerIds },
        }).select("username email");

        const sellerMap = new Map(
            sellers.map((seller) => [
                seller._id.toString(),
                seller,
            ])
        );

        const productsBySellerView = productsBySeller.map((item) => {
            const seller = sellerMap.get(item._id.toString());

            return {
                sellerId: item._id,
                sellerName: seller?.username || "Unknown",
                sellerEmail: seller?.email || "",
                productCount: item.productCount,
                totalStock: item.totalStock,
            };
        });

        const topSellers = productsBySellerView.slice(0, 6);

        return res.json({
            success: true,
            stats: {
                totalUsers,
                totalSellers,
                pendingSellers,
                totalProducts,
                messagesCount,
                totalStock: totalStockAgg[0]?.totalStock || 0,
            },
            productsBySeller: productsBySellerView,
            quantityStats: qtyAgg,
            chartSellerLabels: topSellers.map(
                (seller) => seller.sellerName
            ),
            chartSellerCounts: topSellers.map(
                (seller) => seller.productCount
            ),
        });
    } catch (error) {
        console.error("Admin dashboard API:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load admin dashboard.",
        });
    }
});

// Users
router.get("/api/admin/users", async (req, res) => {
    try {
        const users = await User.find({})
            .select(
                "username email role sellerStatus sellerAppliedAt sellerApprovedAt"
            )
            .sort({ username: 1 });

        return res.json({ success: true, users });
    } catch (error) {
        console.error("Admin users API:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load users.",
        });
    }
});

router.delete("/api/admin/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID.",
            });
        }

        if (id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account here.",
            });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.json({
            success: true,
            message: "User deleted successfully.",
        });
    } catch (error) {
        console.error("Admin delete user API:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete user.",
        });
    }
});

// Sellers
router.get("/api/admin/sellers", async (req, res) => {
    try {
        const sellers = await User.find({ role: "Seller" })
            .select(
                "username email sellerStatus sellerAppliedAt sellerApprovedAt"
            )
            .sort({ username: 1 });

        return res.json({ success: true, sellers });
    } catch (error) {
        console.error("Admin sellers API:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load sellers.",
        });
    }
});

router.get("/api/admin/sellers/:id/products", async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid seller ID.",
            });
        }

        const seller = await User.findById(id).select(
            "username email role sellerStatus"
        );

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found.",
            });
        }

        const products = await Product.find({ author: id }).sort({
            name: 1,
        });

        return res.json({
            success: true,
            seller,
            products,
        });
    } catch (error) {
        console.error("Admin seller products API:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load seller products.",
        });
    }
});

// Products
router.get("/api/admin/products", async (req, res) => {
    try {
        const products = await Product.find({})
            .populate("author", "username email")
            .sort({ name: 1 });

        return res.json({ success: true, products });
    } catch (error) {
        console.error("Admin products API:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load products.",
        });
    }
});

router.delete("/api/admin/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        return res.json({
            success: true,
            message: "Product deleted successfully.",
        });
    } catch (error) {
        console.error("Admin delete product API:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product.",
        });
    }
});

// Customer messages
router.get("/api/admin/messages", async (req, res) => {
    try {
        const messages = await Message.find({})
            .sort({ createdAt: -1 })
            .populate("userId", "username email");

        return res.json({ success: true, messages });
    } catch (error) {
        console.error("Admin messages API:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load messages.",
        });
    }
});

router.delete("/api/admin/messages/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message ID.",
            });
        }

        const message = await Message.findByIdAndDelete(id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found.",
            });
        }

        return res.json({
            success: true,
            message: "Message deleted successfully.",
        });
    } catch (error) {
        console.error("Admin delete message API:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete message.",
        });
    }
});

// Pending seller applications
router.get("/api/admin/pending-sellers", async (req, res) => {
    try {
        const pending = await User.find({
            sellerStatus: "pending",
        })
            .select("username email sellerAppliedAt role")
            .sort({ sellerAppliedAt: -1 });

        return res.json({ success: true, pending });
    } catch (error) {
        console.error("Admin pending sellers API:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load pending seller applications.",
        });
    }
});

router.patch(
    "/api/admin/pending-sellers/:id/approve",
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID.",
                });
            }

            const seller = await User.findOneAndUpdate(
                { _id: id, sellerStatus: "pending" },
                {
                    $set: {
                        role: "Seller",
                        sellerStatus: "approved",
                        sellerApprovedAt: new Date(),
                    },
                },
                { new: true, runValidators: true }
            ).select(
                "username email role sellerStatus sellerApprovedAt"
            );

            if (!seller) {
                return res.status(404).json({
                    success: false,
                    message: "Pending seller application not found.",
                });
            }

            return res.json({
                success: true,
                message: "Seller approved successfully.",
                seller,
            });
        } catch (error) {
            console.error("Admin approve seller API:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to approve seller.",
            });
        }
    }
);

router.patch(
    "/api/admin/pending-sellers/:id/reject",
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!isValidId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID.",
                });
            }

            const seller = await User.findOneAndUpdate(
                { _id: id, sellerStatus: "pending" },
                { $set: { sellerStatus: "rejected" } },
                { new: true, runValidators: true }
            ).select("username email role sellerStatus");

            if (!seller) {
                return res.status(404).json({
                    success: false,
                    message: "Pending seller application not found.",
                });
            }

            return res.json({
                success: true,
                message: "Seller application rejected.",
                seller,
            });
        } catch (error) {
            console.error("Admin reject seller API:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to reject seller application.",
            });
        }
    }
);

module.exports = router;