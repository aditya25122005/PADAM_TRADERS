
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Product = require("../../models/Product");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const { COOKIE_NAME } = require("../../utils/jwt");
const { isLoggedIn } = require("../../middleware");

// API-specific login check: send JSON instead of redirecting to an EJS page.
async function loadOptionalUser(req, res, next) {
    try {
        const token = req.cookies?.[COOKIE_NAME];

        // Prefer JWT authentication.
        if (token && process.env.JWT_SECRET) {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                if (decoded.sub) {
                    const user = await User.findById(
                        decoded.sub
                    ).select("wishlist");

                    if (user) {
                        req.user = user;
                        req.auth = {
                            type: "jwt",
                            userId: user._id.toString(),
                        };

                        return next();
                    }
                }
            } catch (error) {
                const invalidTokenErrors = [
                    "JsonWebTokenError",
                    "TokenExpiredError",
                    "NotBeforeError",
                ];

                if (!invalidTokenErrors.includes(error.name)) {
                    return next(error);
                }
            }
        }

        // Temporary fallback for existing Passport sessions.
        return next();
    } catch (error) {
        return next(error);
    }
}

// Get all products, including whether the current user has wishlisted each one.
router.get("/api/products", loadOptionalUser, async (req, res, next) => {
    try {
        const products = await Product.find({});

        const wishlistIds = Array.isArray(req.user?.wishlist)
            ? req.user.wishlist.map(id => id.toString())
            : [];

        const result = products.map(product => ({
            ...product.toObject(),
            isWishlisted: wishlistIds.includes(product._id.toString())
        }));

        return res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get the current user's saved wishlist products.
router.get("/api/wishlist", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("wishlist");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.json(user.wishlist || []);
    } catch (error) {
        next(error);
    }
});

// Add a product to the wishlist, or remove it if already saved.
router.post("/products/:productId/like", isLoggedIn, async (req, res, next) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const productExists = await Product.exists({ _id: productId });

        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        const user = await User.findById(req.user._id).select("wishlist");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const isLiked = (user.wishlist || []).some(
            id => id.toString() === productId
        );

        if (isLiked) {
            await User.findByIdAndUpdate(user._id, {
                $pull: { wishlist: productId }
            });
        } else {
            await User.findByIdAndUpdate(user._id, {
                $addToSet: { wishlist: productId }
            });
        }

        return res.json({
            success: true,
            wishlisted: !isLiked,
            message: !isLiked
                ? "Product added to wishlist."
                : "Product removed from wishlist."
        });
    } catch (error) {
        next(error);
    }
});

// Get one product for the product details page.
router.get("/api/products/:id", async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(req.params.id)
            .populate("author")
            .populate({
                path: "reviews",
                populate: { path: "author" }
            });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.json(product);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
