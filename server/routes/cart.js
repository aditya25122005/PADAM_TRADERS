const express = require("express");
const mongoose = require("mongoose");

const { isLoggedIn } = require("../middleware");
const Product = require("../models/Product");
const User = require("../models/User");

const router = express.Router();

// Get cart
router.get("/api/cart", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate("cart");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.json(user.cart);
    } catch (error) {
        return next(error);
    }
});

// Add product to cart
router.post("/api/cart/:productId", isLoggedIn, async (req, res, next) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID.",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        user.cart.push(productId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Added to cart successfully.",
        });
    } catch (error) {
        return next(error);
    }
});

// Remove product from cart
router.delete(
    "/api/cart/:productId",
    isLoggedIn,
    async (req, res, next) => {
        try {
            const { productId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID.",
                });
            }

            const user = await User.findById(req.user._id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            user.cart.pull(productId);
            await user.save();

            return res.json({
                success: true,
                message: "Product removed from cart.",
            });
        } catch (error) {
            return next(error);
        }
    }
);

module.exports = router;