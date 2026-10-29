const express = require("express");

const Product = require("../models/Product");
const Review = require("../models/Review");
const { isLoggedIn, isReviewAuthor } = require("../middleware");

const router = express.Router();

// Get reviews for a product
router.get("/api/products/:id/reviews", async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate({
            path: "reviews",
            populate: {
                path: "author",
                select: "username",
            },
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.json(product.reviews);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        return next(error);
    }
});

// Add a review
router.post(
    "/api/products/:id/reviews",
    isLoggedIn,
    async (req, res, next) => {
        try {
            const { rating, comment } = req.body;
            const numericRating = Number(rating);

            if (
                rating === undefined ||
                rating === null ||
                rating === "" ||
                !Number.isInteger(numericRating) ||
                numericRating < 1 ||
                numericRating > 5
            ) {
                return res.status(400).json({
                    message: "Please select a rating from 1 to 5.",
                });
            }

            const product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found",
                });
            }

            const review = await Review.create({
                rating: numericRating,
                comment,
                author: req.user._id,
            });

            product.reviews.push(review._id);
            await product.save();

            const savedReview = await Review.findById(review._id)
                .populate("author", "username");

            return res.status(201).json(savedReview);
        } catch (error) {
            if (error.name === "CastError") {
                return res.status(400).json({
                    message: "Invalid product ID",
                });
            }

            return next(error);
        }
    }
);

// Delete a review
router.delete(
    "/api/products/:productID/reviews/:reviewID",
    isLoggedIn,
    isReviewAuthor,
    async (req, res, next) => {
        try {
            const { productID, reviewID } = req.params;

            const product = await Product.findById(productID);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found",
                });
            }

            const review = await Review.findById(reviewID);

            if (!review) {
                return res.status(404).json({
                    message: "Review not found",
                });
            }

            product.reviews.pull(review._id);
            await product.save();
            await review.deleteOne();

            return res.json({
                message: "Review deleted successfully",
            });
        } catch (error) {
            if (error.name === "CastError") {
                return res.status(400).json({
                    message: "Invalid product or review ID",
                });
            }

            return next(error);
        }
    }
);

module.exports = router;