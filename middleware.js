const Product = require('./models/Product'); 
const { reviewSchema, productSchema } = require("./schema");
const Review = require('./models/Review');

/* =====================================================
   PRODUCT VALIDATION
===================================================== */
const validateProduct = (req, res, next) => {
    let { name, img, price, desc, quantity, stock } = req.body;
    const { error } = productSchema.validate({ name, img, price, desc, quantity, stock });
    if (error) {
        return res.render('error', { error: error.details[0].message });
    }
    next();
};

/* =====================================================
   REVIEW VALIDATION
===================================================== */
const validateReview = (req, res, next) => {
    let { rating, comment } = req.body;
    const { error } = reviewSchema.validate({ rating, comment });
    if (error) {
        return res.render('error', { error: error.details[0].message });
    }
    next();
};

/* =====================================================
   LOGIN CHECK
===================================================== */
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error','Please Login First');
        return res.redirect('/login');
    }
   return next();
};

/* =====================================================
   SELLER CHECK (UPDATED & SECURE)
===================================================== */

const isSeller = (req, res, next) => {
    if (!req.user) {
        req.flash('error', "You must be logged in");
        return res.redirect('/login');
    }

    // ⭐ Admin has all permissions
    if (req.user.role === "Admin") {
        return next();
    }

    if (req.user.role !== "Seller") {
        req.flash('error', "You don't have access (not a seller)");
        return res.redirect('/products');
    }

    if (req.user.sellerStatus !== "approved") {
        req.flash('error', "Your seller account is not approved yet.");
        return res.redirect('/products');
    }

    next();
};



/* =====================================================
   PRODUCT AUTHOR CHECK
===================================================== */
const isProductAuthor = async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate('author');

    if (!product) {
        req.flash('error', "Product not found");
        return res.redirect('/products');
    }

    // Admin bypass
    if (req.user.role === "Admin") {
        return next();
    }

    // Compare author IDs properly
    if (product.author._id.toString() !== req.user._id.toString()) {
        req.flash('error', "You don't have permission to do that");
        return res.redirect('/products');
    }

    next();
};

/* =====================================================
   REVIEW AUTHOR CHECK
===================================================== */
const isReviewAuthor = async (req, res, next) => {
    const { productID, reviewID } = req.params;

    try {
        const review = await Review.findById(reviewID);

        // If review doesn't exist
        if (!review) {
            req.flash("error", "Review not found.");
            return res.redirect(`/products/${productID}`);
        }

        // If ADMIN → allow deletion of any review
        if (req.user && req.user.role === "Admin") {
            return next();
        }

        // If REVIEW AUTHOR → allow deleting their own review
        if (review.author && review.author.equals(req.user._id)) {
            return next();
        }

        // Otherwise deny
        req.flash("error", "You do not have permission to delete this review.");
        return res.redirect(`/products/${productID}`);

    } catch (e) {
        req.flash("error", "Unexpected error occurred.");
        return res.redirect(`/products/${productID}`);
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user) {
        req.flash("error", "Please login first.");
        return res.redirect("/login");
    }
    if (req.user.role !== "Admin") {
        req.flash("error", "Access denied. Admins only.");
        return res.redirect("/products");
    }
    next();
};

/* =====================================================
   SET USER LOCALS
===================================================== */
function setUser(req, res, next) {
    res.locals.user = req.user || null;
    res.locals.currentUser = req.user || null;  // added
    next();
}

module.exports = { 
    isLoggedIn,
    setUser,
    validateProduct,
    validateReview,
    isSeller,
    isProductAuthor, 
    isReviewAuthor,
    isAdmin
};
