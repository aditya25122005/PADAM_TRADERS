const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Product = require("../../models/Product");
const User = require("../../models/User");
const { COOKIE_NAME } = require("../../utils/jwt");
const { isLoggedIn } = require("../../middleware");

const router = express.Router();

async function loadOptionalUser(req, res, next) {
    try {
        const token = req.cookies?.[COOKIE_NAME];

        if (token && process.env.JWT_SECRET) {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                if (typeof decoded.sub === "string") {
                    const user = await User.findById(
                        decoded.sub
                    ).select("wishlist");

                    if (user) {
                        req.user = user;
                        req.auth = {
                            type: "jwt",
                            userId: user._id.toString(),
                        };
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

        return next();
    } catch (error) {
        return next(error);
    }
}

router.get("/api/products", loadOptionalUser, async (req, res, next) => {
    try {
        const products = await Product.find({});

        const wishlistIds = Array.isArray(req.user?.wishlist)
            ? req.user.wishlist.map((id) => id.toString())
            : [];

        const result = products.map((product) => ({
            ...product.toObject(),
            isWishlisted: wishlistIds.includes(
                product._id.toString()
            ),
        }));

        return res.json(result);
    } catch (error) {
        return next(error);
    }
});

router.get("/api/wishlist", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("wishlist");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.json(user.wishlist || []);
    } catch (error) {
        return next(error);
    }
});

router.post(
    "/products/:productId/like",
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

            const productExists = await Product.exists({
                _id: productId,
            });

            if (!productExists) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found.",
                });
            }

            const user = await User.findById(req.user._id)
                .select("wishlist");

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            const isLiked = (user.wishlist || []).some(
                (id) => id.toString() === productId
            );

            if (isLiked) {
                await User.findByIdAndUpdate(user._id, {
                    $pull: { wishlist: productId },
                });
            } else {
                await User.findByIdAndUpdate(user._id, {
                    $addToSet: { wishlist: productId },
                });
            }

            return res.json({
                success: true,
                wishlisted: !isLiked,
                message: isLiked
                    ? "Product removed from wishlist."
                    : "Product added to wishlist.",
            });
        } catch (error) {
            return next(error);
        }
    }
);

router.get("/api/products/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid product ID.",
            });
        }

        const product = await Product.findById(id)
            .populate("author")
            .populate({
                path: "reviews",
                populate: {
                    path: "author",
                },
            });

        if (!product) {
            return res.status(404).json({
                message: "Product not found.",
            });
        }

        return res.json(product);
    } catch (error) {
        return next(error);
    }
});

module.exports = router;