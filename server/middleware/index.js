const Product = require('../models/Product');
const { reviewSchema, productSchema } = require('../schema');
const Review = require('../models/Review');
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { COOKIE_NAME,
        clearTokenCookie,
    } = require("../utils/jwt");

const validateProduct = (req, res, next) => {
    const { name, img, price, desc, quantity, stock } = req.body;

    const { error, value } = productSchema.validate({
        name,
        img,
        price,
        desc,
        quantity,
        stock,
    });

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    Object.assign(req.body, value);
    next();
};

const validateReview = (req, res, next) => {
    const { rating, comment } = req.body;
    const { error } = reviewSchema.validate({ rating, comment });

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }

    next();
};

const isLoggedIn = async (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];

    // 1. Try JWT authentication first.
    if (token) {
        try {
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is missing.");
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            if (typeof decoded.sub !== "string") {
                clearTokenCookie(res);
            } else {
                const user = await User.findById(decoded.sub);

                if (user) {
                    req.user = user;
                    req.auth = {
                        type: "jwt",
                        userId: user._id.toString(),
                    };

                    return next();
                }

                // Account was deleted or no longer exists.
                clearTokenCookie(res);
            }
        } catch (error) {
            const invalidTokenErrors = [
                "JsonWebTokenError",
                "TokenExpiredError",
                "NotBeforeError",
            ];

            if (invalidTokenErrors.includes(error.name)) {
                clearTokenCookie(res);
            } else {
                return next(error);
            }
        }
    }

    return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
    });
};

const isSeller = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Please log in first.',
        });
    }

    if (req.user.role === 'Admin') {
        return next();
    }

    if (req.user.role !== 'Seller') {
        return res.status(403).json({
            success: false,
            message: 'Only sellers can perform this action.',
        });
    }

    if (req.user.sellerStatus !== 'approved') {
        return res.status(403).json({
            success: false,
            message: 'Your seller account is not approved yet.',
        });
    }

    next();
};

const isProductAuthor = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Please log in first.',
            });
        }

        const id = req.params.id || req.params.productId;
        const product = await Product.findById(id).populate('author');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.',
            });
        }

        if (req.user.role === 'Admin') {
            return next();
        }

        if (
            product.author &&
            product.author._id.toString() === req.user._id.toString()
        ) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "You don't have permission to edit or delete this product.",
        });
    } catch (error) {
        next(error);
    }
};

const isReviewAuthor = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Please log in first.',
            });
        }

        const reviewID = req.params.reviewID || req.params.reviewId;
        const review = await Review.findById(reviewID);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found.',
            });
        }

        if (req.user.role === 'Admin') {
            return next();
        }

        if (
            review.author &&
            review.author.toString() === req.user._id.toString()
        ) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "You don't have permission to delete this review.",
        });
    } catch (error) {
        next(error);
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Please log in first.',
        });
    }

    if (req.user.role !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admins only.',
        });
    }

    next();
};

const authenticateJWT = async (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please log in.",
        });
    }

    if (!process.env.JWT_SECRET) {
        return next(new Error("JWT_SECRET is missing."));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.sub) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
        }

        const user = await User.findById(decoded.sub).select("-hash -salt");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found.",
            });
        }

        req.user = user;
        req.auth = {
            type: "jwt",
            userId: user._id.toString(),
        };

        return next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token. Please log in again.",
            });
        }

        return next(error);
    }
};

module.exports = {
    isLoggedIn,
    validateProduct,
    validateReview,
    isSeller,
    isProductAuthor,
    isReviewAuthor,
    isAdmin,
    authenticateJWT,
};