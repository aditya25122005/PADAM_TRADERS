const express=require('express');
const { isLoggedIn } = require('../middleware');
const Product = require('../models/Product');
const User = require('../models/User');
const router=express.Router();



/* React API: Get cart */
router.get('/api/cart', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('cart');

        res.json(user.cart);
    } catch (error) {
        next(error);
    }
});

/* React API: Add product to cart */
router.post('/api/cart/:productId', isLoggedIn, async (req, res, next) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const user = await User.findById(req.user._id);
        user.cart.push(productId);
        await user.save();

        res.status(200).json({
            message: 'Added to cart successfully'
        });
    } catch (error) {
        next(error);
    }
});

/* React API: Remove product from cart */
router.delete('/api/cart/:productId', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        user.cart.pull(req.params.productId);
        await user.save();

        res.json({
            message: 'Product removed from cart'
        });
    } catch (error) {
        next(error);
    }
});



module.exports=router;