const express= require('express');
const Product= require('../models/Product');
const Review= require('../models/Review');
const router= express.Router();
const {isLoggedIn, isReviewAuthor}=require('../middleware');


/* React API: Get reviews for a product */
router.get('/api/products/:id/reviews', async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: 'reviews',
                populate: { path: 'author', select: 'username' }
            });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product.reviews);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        next(error);
    }
});

/* React API: Add a review */
router.post('/api/products/:id/reviews', isLoggedIn, async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                message: 'Please select a rating from 1 to 5.'
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const review = new Review({
            rating: Number(rating),
            comment,
            author: req.user._id
        });

        await review.save();
        product.reviews.push(review._id);
        await product.save();

        const savedReview = await Review.findById(review._id)
            .populate('author', 'username');

        res.status(201).json(savedReview);
    } catch (error) {
        next(error);
    }
});

/* React API: Delete own review (or as permitted by existing middleware) */
router.delete(
    '/api/products/:productID/reviews/:reviewID',
    isLoggedIn,
    isReviewAuthor,
    async (req, res, next) => {
        try {
            const { productID, reviewID } = req.params;

            await Product.findByIdAndUpdate(productID, {
                $pull: { reviews: reviewID }
            });

            await Review.findByIdAndDelete(reviewID);

            res.json({ message: 'Review deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
);

module.exports=router;