const express = require('express');
const Product = require('../models/Product');
const { isLoggedIn, validateProduct, isSeller, isProductAuthor } = require('../middleware');
const User = require('../models/User');

const router = express.Router();

// =======================
// Show all products
// =======================
router.get('/products', isLoggedIn, async (req, res) => {
    try {
        let products = await Product.find({}).populate('reviews');
        let user = null;

        if (req.user) {
            user = await User.findById(req.user._id).populate('wishlist');
        }

        res.render('products/index', { products, currentuser: user });
    } catch (e) {
        res.status(404).send("Error in finding products");
    }
});

// =======================
// Add new product (ONLY SELLERS)
// =======================
router.get('/products/new', isLoggedIn, isSeller, (req, res) => {
    res.render('products/new');
});

router.post('/products', isLoggedIn, isSeller, validateProduct, async (req, res) => {
    try {
        let { name, img, stock, quantity, price, desc } = req.body;
        await Product.create({
            name,
            img,
            stock,
            quantity,
            price,
            desc,
            author: req.user._id
        });

        req.flash('success', 'Product added successfully');
        res.redirect('/products');
    } catch (err) {
        console.log(err);
        res.status(404).send("Cannot add new product");
    }
});

// =======================
// Show individual product
// =======================
router.get('/products/:id', isLoggedIn, async (req, res) => {
    try {
        let foundProduct = await Product.findById(req.params.id)
            .populate('author')
            .populate({
                path: 'reviews',
                populate: { path: 'author' }
            });

        res.render('products/show', { foundProduct });
    } catch (e) {
        res.status(404).send("Error in finding product");
    }
});

// =======================
// Edit product (Seller who owns OR Admin)
// =======================
router.get('/products/:id/edit',
    isLoggedIn,
    isProductAuthor,    // ⭐ Seller who created OR Admin
    async (req, res) => {
        let foundProduct = await Product.findById(req.params.id);
        res.render('products/edit', { foundProduct });
    }
);

// =======================
// Update product (Seller who owns OR Admin)
// =======================
router.patch('/products/:id',
    isLoggedIn,
    isProductAuthor,    // ⭐ Seller who created OR Admin
    validateProduct,
    async (req, res) => {
        let { id } = req.params;
        let { name, img, quantity, price, desc, stock } = req.body;

        await Product.findByIdAndUpdate(id, {
            name,
            img,
            quantity,
            price,
            desc,
            stock
        });

        req.flash('success', 'Product edited successfully');
        res.redirect(`/products/${id}`);
    }
);

// =======================
// Delete product (Seller who owns OR Admin)
// =======================
router.delete('/product/:id',
    isLoggedIn,
    isProductAuthor,   // ⭐ Seller who created OR Admin
    async (req, res) => {
        await Product.findByIdAndDelete(req.params.id);
        req.flash('success', 'Product deleted successfully');
        res.redirect('/products');
    }
);

// =======================
// Wishlist Like/Unlike
// =======================
router.post('/products/:id/like', isLoggedIn, async (req, res) => {
    try {
        let { id } = req.params;
        let product = await Product.findById(id);
        let user = req.user;

        const isLiked = user.wishlist.includes(product._id);

        if (isLiked) {
            await User.findByIdAndUpdate(user._id, {
                $pull: { wishlist: product._id }
            });
        } else {
            await User.findByIdAndUpdate(user._id, {
                $push: { wishlist: product._id }
            });
        }

        res.status(200).send('Wishlist updated successfully');
    } catch (e) {
        console.error('Error updating wishlist:', e);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
